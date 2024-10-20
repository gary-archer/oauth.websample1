import {ApiClient} from '../api/client/apiClient';
import {Configuration} from '../configuration/configuration';
import {ConfigurationLoader} from '../configuration/configurationLoader';
import {Authenticator} from '../plumbing/oauth/authenticator';
import {OidcLogger} from '../plumbing/utilities/oidcLogger';
import {ErrorView} from '../views/errorView';
import {HeaderButtonsView} from '../views/headerButtonsView';
import {Router} from '../views/router';
import {TitleView} from '../views/titleView';

/*
 * The application class
 */
class App {

    private configuration!: Configuration;
    private authenticator!: Authenticator;
    private apiClient!: ApiClient;
    private oidcLogger: OidcLogger;
    private router!: Router;
    private titleView!: TitleView;
    private headerButtonsView!: HeaderButtonsView;
    private errorView!: ErrorView;
    private isInitialised: boolean;

    public constructor() {
        this.isInitialised = false;
        this.oidcLogger = new OidcLogger();
        this.setupCallbacks();
    }

    /*
     * The entry point for the SPA
     */
    public async execute(): Promise<void> {

        try {
            // Start listening for hash changes
            window.onhashchange = this.onHashChange;

            // Do the initial render
            this.initialRender();

            // Do one time app initialisation
            await this.initialiseApp();

            // We must be prepared for page invocation to be an OAuth login response
            await this.handleLoginResponse();

            // Attempt to load data from the API, which may trigger a login redirect
            await this.loadMainView();

        } catch (e: any) {

            // Render the error view if there are problems
            this.errorView?.report(e);
        }
    }

    /*
     * Render views in their initial state
     */
    private initialRender() {

        this.titleView = new TitleView();
        this.titleView.load();

        this.headerButtonsView = new HeaderButtonsView(this.onHome, this.onReloadData, this.onExpireToken);
        this.headerButtonsView.load();

        this.errorView = new ErrorView();
        this.errorView.load();
    }

    /*
     * Initialise the app when the page loads
     */
    private async initialiseApp(): Promise<void> {

        // Download application configuration
        this.configuration = await ConfigurationLoader.download('spa.config.json');

        // Initialise our wrapper class around oidc-client
        this.authenticator = new Authenticator(this.configuration.oauth);

        // Create a client to reliably call the API
        this.apiClient = new ApiClient(this.configuration.app.apiBaseUrl, this.authenticator);

        // Our simple router passes the API Client instance between views
        this.router = new Router(this.apiClient, this.errorView);

        // Update state to indicate that global objects are loaded
        this.isInitialised = true;
    }

    /*
     * Handle login responses on page load and also render user info if we have tokens
     */
    private async handleLoginResponse(): Promise<void> {

        // Do the OAuth work
        await this.authenticator.handleLoginResponse();

        // Then update displayed user info
        this.titleView.loadUserInfo(this.authenticator);
    }

    /*
     * Load API data for the main view and update UI controls
     */
    private async loadMainView(): Promise<void> {

        this.headerButtonsView.disableSessionButtons();
        await this.router.loadView();
        this.headerButtonsView.enableSessionButtons();
    }

    /*
     * Change the view based on the hash URL and catch errors
     */
    private async onHashChange(): Promise<void> {

        // Handle updates to log levels when the URL log setting is changed
        this.oidcLogger.updateLogLevelIfRequired();

        try {

            // Update the main view when the hash location changes
            if (this.isInitialised) {
                await this.loadMainView();
            }

        } catch (e: any) {

            // Report failures
            this.errorView.report(e);
        }
    }

    /*
     * The home button moves to the home view but also deals with error recovery
     */
    private async onHome(): Promise<void> {

        try {

            // If we have not initialised, re-initialise the app
            if (!this.isInitialised) {
                await this.initialiseApp();
            }

            if (this.isInitialised) {

                if (this.router.isInHomeView()) {

                    // Force a reload if we are already in the home view
                    await this.router.loadView();

                } else {

                    // Otherwise move to the home view
                    location.hash = '#';
                }
            }

        } catch (e: any) {
            this.errorView.report(e);
        }
    }

    /*
     * Force data reload
     */
    private async onReloadData(): Promise<void> {

        try {
            // Try to reload data
            await this.loadMainView();

        } catch (e: any) {

            // Report failures
            this.errorView.report(e);
        }
    }

    /*
     * Force a new access token to be retrieved
     */
    private async onExpireToken(): Promise<void> {
        await this.authenticator.expireAccessToken();
    }

    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    private setupCallbacks(): void {
        this.initialiseApp = this.initialiseApp.bind(this);
        this.handleLoginResponse = this.handleLoginResponse.bind(this);
        this.loadMainView = this.loadMainView.bind(this);
        this.onHashChange = this.onHashChange.bind(this);
        this.onHome = this.onHome.bind(this);
        this.onReloadData = this.onReloadData.bind(this);
        this.onExpireToken = this.onExpireToken.bind(this);
    }
}

/*
 * Run the application
 */
const app = new App();
app.execute();
