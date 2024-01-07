import {UserManager} from 'oidc-client';
import urlparse from 'url-parse';
import {UserInfo} from '../../api/entities/userInfo';
import {OAuthConfiguration} from '../../configuration/oauthConfiguration';
import {ErrorCodes} from '../errors/errorCodes';
import {ErrorHandler} from '../errors/errorHandler';
import {UIError} from '../errors/uiError';

/*
 * The entry point for initiating login and token requests
 */
export class Authenticator {

    private readonly _userManager: UserManager;
    private _loginTime: number | null;

    public constructor(config: OAuthConfiguration) {

        // Create OIDC settings from our application configuration
        const settings = {

            // Base client settings
            authority: config.authority,
            client_id: config.clientId,
            redirect_uri: config.redirectUri,
            scope: config.scope,

            // Use the Authorization Code Flow (PKCE)
            response_type: 'code',

            // The UI loads user info from the OpenID Connect user info endpoint
            loadUserInfo: true,

            // Disable these features which we are not using in this sample
            automaticSilentRenew: false,
            monitorSession: false,

        };

        // Create the user manager
        this._userManager = new UserManager(settings);
        this._loginTime = null;
    }

    /*
     * Get the current access token
     */
    public async getAccessToken(): Promise<string | null> {

        const user = await this._userManager.getUser();
        if (user && user.access_token) {
            return user.access_token;
        }

        return null;
    }

    /*
     * Do the interactive login redirect on the main window
     */
    public async startLogin(apiError: UIError | null): Promise<void> {

        try {

            // First store the SPA's client side location
            const data = {
                hash: location.hash.length > 0 ? location.hash : '#',
            };

            // This code is specific to the first code sample, which does not yet implement token refresh
            // Therefore, to get a new access token a login redirect is triggered
            // This code prevents a redirect loop in the event of the API being configured incorrectly
            if (this._loginTime) {
                const currentTime = new Date().getTime();
                const millisecondsSinceLogin = currentTime - this._loginTime;
                if (millisecondsSinceLogin < 250) {
                    throw apiError;
                }
            }

            // Start a login redirect
            await this._userManager.signinRedirect({state: data});

        } catch (e: any) {

            // Handle OAuth specific errors, such as CORS errors calling the metadata endpoint
            throw ErrorHandler.getFromLoginOperation(e, ErrorCodes.loginRequestFailed);
        }
    }

    /*
     * Handle the response from the authorization server
     */
    public async handleLoginResponse(): Promise<void> {

        // If the page loads with a state query parameter we classify it as an OAuth response
        const urlData = urlparse(location.href, true);
        if (urlData.query && urlData.query.state) {

            // Only try to process a login response if the state exists
            const storedState = await this._userManager.settings.stateStore?.get(urlData.query.state);
            if (storedState) {

                let redirectLocation = '#';
                try {

                    // Handle the login response
                    const user = await this._userManager.signinRedirectCallback();

                    // We will return to the app location before the login redirect
                    redirectLocation = user.state.hash;

                    // The login time enables a check that avoids redirect loops when configuration is invalid
                    this._loginTime = new Date().getTime();

                } catch (e: any) {

                    // Handle and rethrow OAuth response errors
                    throw ErrorHandler.getFromLoginOperation(e, ErrorCodes.loginResponseFailed);

                } finally {

                    // Always replace the browser location, to remove OAuth details from back navigation
                    history.replaceState({}, document.title, redirectLocation);
                }
            }
        }
    }

    /*
     * Get user info, which is available once authentication has completed
     */
    public async getUserInfo(): Promise<UserInfo | null> {

        const user = await this._userManager.getUser();
        if (user && user.profile) {
            if (user.profile.given_name && user.profile.family_name) {

                return {
                    givenName: user.profile.given_name,
                    familyName: user.profile.family_name,
                };
            }
        }

        return null;
    }

    /*
     * This method is for testing only, to make the access token in storage act like it has expired
     */
    public async expireAccessToken(): Promise<void> {

        const user = await this._userManager.getUser();
        if (user) {

            // Add a character to the signature to make it fail validation
            user.access_token = `${user.access_token}x`;
            this._userManager.storeUser(user);
        }
    }
}
