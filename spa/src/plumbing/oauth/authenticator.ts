import {UserManager} from 'oidc-client';
import urlparse from 'url-parse';
import {UserInfoClaims} from '../../api/entities/userInfoClaims';
import {OAuthConfiguration} from '../../configuration/oauthConfiguration';
import {ErrorCodes} from '../errors/errorCodes';
import {ErrorHandler} from '../errors/errorHandler';

/*
 * The entry point for initiating login and token requests
 */
export class Authenticator {

    // Global OAuth fields
    private readonly _userManager: UserManager;

    /*
     * Initialise OAuth settings and create the OIDC Client UserManager object
     */
    public constructor(config: OAuthConfiguration) {

        // Create OIDC settings from our application configuration
        const settings = {

            // Base client settings
            authority: config.authority,
            client_id: config.clientId,
            redirect_uri: config.appUri,
            scope: config.scope,

            // Use the Authorization Code Flow (PKCE)
            response_type: 'code',

            // The UI will get the user name from the user info endpoint
            loadUserInfo: true,

            // Disable these features which we are not using in this sample
            automaticSilentRenew: false,
            monitorSession: false,

        };

        // Create the user manager
        this._userManager = new UserManager(settings);
    }

    /*
     * Get an access token, or trigger a login
     */
    public async getAccessToken(): Promise<string> {

        // On most calls we just return the existing token from HTML5 storage
        const user = await this._userManager.getUser();
        if (user && user.access_token) {
            return user.access_token;
        }

        // Trigger a login redirect, which short fails the API request
        await this._startLogin();

        // Return a known exception to the API request which brought us here
        throw ErrorHandler.getFromLoginRequired();
    }

    /*
     * Handle the response from the authorization server
     */
    public async handleLoginResponse(): Promise<void> {

        // If the page loads with a state query parameter we classify it as an OAuth response
        const urlData = urlparse(location.href, true);
        if (urlData.query && urlData.query.state) {

            try {
                // Handle the response
                const user = await this._userManager.signinRedirectCallback();

                // Get the hash URL before the redirect
                const data = JSON.parse(user.state);

                // Replace the browser location, and remove the OAuth code and state parameters from the URL
                // This avoids potential navigation and page refresh problems
                history.replaceState({}, document.title, data.hash);

            } catch (e) {

                // Prevent back navigation problems after errors
                history.replaceState({}, document.title, '#');

                // Handle OAuth response errors
                throw ErrorHandler.getFromLoginResponse(e, ErrorCodes.loginResponseFailed);
            }
        }
    }

    /*
     * Get user info, which is available once authentication has completed
     */
    public async getUserInfo(): Promise<UserInfoClaims | null> {

        const user = await this._userManager.getUser();
        if (user && user.profile) {
            if (user.profile.given_name && user.profile.family_name && user.profile.email) {

                return {
                    givenName: user.profile.given_name,
                    familyName: user.profile.family_name,
                    email: user.profile.email,
                };
            }
        }

        return null;
    }

    /*
     * Clear tokens, which for the initial sample will force a login on the next API request
     */
    public async clearAccessToken(): Promise<void> {
        await this._userManager.removeUser();
    }

    /*
     * This method is for testing only, to make the access token in storage act like it has expired
     */
    public async expireAccessToken(): Promise<void> {

        const user = await this._userManager.getUser();
        if (user) {

            // This will cause the next call to the API to return 401
            user.access_token = 'x' + user.access_token + 'x';
            this._userManager.storeUser(user);
        }
    }

    /*
     * Do the interactive login redirect on the main window
     */
    private async _startLogin(): Promise<void> {

        // Otherwise start a login redirect, by first storing the SPA's client side location
        const data = {
            hash: location.hash.length > 0 ? location.hash : '#',
        };

        try {
            // Start a login redirect
            await this._userManager.signinRedirect({state: JSON.stringify(data)});

        } catch (e) {

            // Handle OAuth specific errors, such as those calling the metadata endpoint
            throw ErrorHandler.getFromLoginRequest(e, ErrorCodes.loginRequestFailed);
        }
    }
}
