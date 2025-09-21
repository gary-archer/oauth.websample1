import {UserManager, WebStorageStateStore} from 'oidc-client-ts';
import {UserInfo} from '../../api/entities/userInfo';
import {OAuthConfiguration} from '../../configuration/oauthConfiguration';
import {ErrorCodes} from '../errors/errorCodes';
import {ErrorHandler} from '../errors/errorHandler';

/*
 * The entry point for initiating login and token requests
 */
export class OAuthClient {

    private readonly userManager: UserManager;

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

            // Store redirect state such as PKCE verifiers in session storage
            stateStore: new WebStorageStateStore({ store: sessionStorage }),

            // The first code example uses session storage of tokens
            userStore: new WebStorageStateStore({ store: sessionStorage }),

            // The UI loads user info from the OpenID Connect user info endpoint
            loadUserInfo: true,

            // Disable these features which we are not using in this sample
            automaticSilentRenew: false,
            monitorSession: false,

        };

        // Create the user manager
        this.userManager = new UserManager(settings);
    }

    /*
     * Indicate whether the user has a valid session
     */
    public async getIsLoggedIn(): Promise<boolean> {

        const user = await this.userManager.getUser();
        return !!user;
    }

    /*
     * Get the current access token
     */
    public async getAccessToken(): Promise<string | null> {

        const user = await this.userManager.getUser();
        if (user && user.access_token) {
            return user.access_token;
        }

        return null;
    }

    /*
     * Do the interactive login redirect on the main window
     */
    public async startLogin(currentLocation: string): Promise<void> {

        try {

            // First store the SPA's client side location
            const data = {
                hash: currentLocation,
            };

            // Start a login redirect
            await this.userManager.signinRedirect({state: data});

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
                const storedState = await this.userManager.settings.stateStore?.get(state);
                if (storedState) {

                    let redirectLocation = '#';
                    try {

                        // Handle the login response
                        const user = await this.userManager.signinRedirectCallback();

                        // We will return to the app location before the login redirect
                        redirectLocation = (user.state as any).hash;

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

        const user = await this.userManager.getUser();
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

        const user = await this.userManager.getUser();
        if (user) {

            // Add a character to the signature to make it fail validation
            user.access_token = `${user.access_token}x`;
            this.userManager.storeUser(user);
        }
    }

    /*
     * For the first code sample, the session expires when APIs return a 401 response
     */
    public async setSessionExpired(): Promise<void> {
        await this.userManager.removeUser();
    }
}
