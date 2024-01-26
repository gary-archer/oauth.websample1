import {UserManager} from 'oidc-client';
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
    public async startLogin(api401Error: UIError | null): Promise<void> {

        try {

            // First store the SPA's client side location
            const data = {
                hash: location.hash.length > 0 ? location.hash : '#',
            };

            // This code is specific to the first code sample, which does not yet implement token refresh
            // It prevents a redirect loop, where a new login is triggered very soon after a previous one
            // This can potentially happen if there is a configuration problem in SPA or API
            // In such an event, this code displays the details of the API 401 error rather than trying a new login
            if (api401Error && this._loginTime) {

                const currentTime = new Date().getTime();
                const millisecondsSinceLogin = currentTime - this._loginTime;
                if (millisecondsSinceLogin < 250) {
                    throw api401Error;
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
        if (location.search) {

            const args = new URLSearchParams(location.search);
            const state = args.get('state');
            if (state) {

                // Only try to process a login response if the state exists
                const storedState = await this._userManager.settings.stateStore?.get(state);
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
