import {OAuthConfiguration} from '../../configuration/oauthConfiguration';
import {UserInfoClaims} from '../../entities/userInfoClaims';
import {ErrorHandler} from '../errors/errorHandler';
import {UrlHelper} from '../utilities/urlHelper';
import {CustomUserManager} from './customUserManager';

/*
 * The entry point for initiating login and token requests
 */
export class Authenticator {

    /*
     * Our override of the OIDC Client class does all of the real security processing
     */
    private readonly _userManager: CustomUserManager;

    /*
     * Class setup
     */
    public constructor(config: OAuthConfiguration) {

        // Create OIDC settings from our application configuration
        const settings = {
            authority: config.authority,
            client_id: config.clientId,
            redirect_uri: config.appUri,
            scope: config.scope,

            // Initially we'll use this flow for simplicity and the UI will get user info directly
            response_type: 'token',
            loadUserInfo: true,

            // Disable these features which we are not using in this sample
            automaticSilentRenew: false,
            monitorSession: false,
        };

        // Create the user manager
        this._userManager = new CustomUserManager(settings);
        this._setupCallbacks();
    }

    /*
     * Get an access token and login if required
     */
    public async getAccessToken(): Promise<string> {

        // On most calls we just return the existing token from HTML5 storage
        const user = await this._userManager.getUser();
        if (user && user.access_token && user.access_token.length > 0) {
            return user.access_token;
        }

        // Store the SPA's client side location
        const data = {
            hash: location.hash.length > 0 ? location.hash : '#',
        };

        try {
            // Start a login redirect
            await this._userManager.signinRedirect({state: JSON.stringify(data)});

            // Short circuit normal SPA page execution and do not try to render the view
            throw ErrorHandler.getFromLoginRequired();

        } catch (e) {

            // Handle OAuth specific errors, such as those calling the metadata endpoint
            throw ErrorHandler.getFromOAuthRequest(e, 'login_request_failed');
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
                } as UserInfoClaims;
            }
        }

        return null;
    }

    /*
     * Handle the response from the authorization server
     */
    public async handleLoginResponse(): Promise<void> {

        // If the page loads with a state query parameter we classify it as an OAuth response
        const query = UrlHelper.getLocationHashData();
        if (!query.state) {
            return;
        }

        try {
            // Handle the response
            const user = await this._userManager.signinRedirectCallback();

            // Get the hash URL before the redirect
            const data = JSON.parse(user.state);

            // Replace the browser location, to prevent tokens being available during back navigation
            history.replaceState({}, document.title, data.hash);

        } catch (e) {

            // Handle OAuth response errors
            throw ErrorHandler.getFromOAuthResponse(e, 'login_response_failed');
        }
    }

    /*
     * Clear the current access token from storage to force a login
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

            // Set the stored value to 60 minutes in the future so that OIDC Client does a token renewal shortly
            // Also corrupt the current token so that there is a 401 if it is sent to the API
            user.expires_at = Date.now() / 1000 + 60;
            user.access_token = 'x' + user.access_token + 'x';

            // Update OIDC so that it silently renews the token almost immediately
            this._userManager.storeUser(user);
            this._userManager.stopSilentRenew();
            this._userManager.startSilentRenew();
        }
    }

            /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    private _setupCallbacks(): void {
        this.clearAccessToken = this.clearAccessToken.bind(this);
        this.getAccessToken = this.getAccessToken.bind(this);
   }
}
