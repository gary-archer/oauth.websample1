import $ from 'jquery';
import {ApiClient} from './api/client/apiClient';
import {Configuration} from './configuration/configuration';
import {ConfigurationLoader} from './configuration/configurationLoader';
import {Authenticator} from './plumbing/oauth/authenticator';
import {TraceListener} from './plumbing/oauth/trace/traceListener';
import {ErrorView} from './views/errorView';
import {HeaderButtonsView} from './views/headerButtonsView';
import {Router} from './views/router';
import {TitleView} from './views/titleView';
import {TraceView} from './views/traceView';

/*
 * The application class
 */
class App {

    // OAuth and API related classes
    private _configuration!: Configuration;
    private _authenticator!: Authenticator;
    private _apiClient!: ApiClient;
    private _router!: Router;
    private _traceListener!: TraceListener;
    private _isLoaded: boolean;

    // Child views
    private _titleView!: TitleView;
    private _headerButtonsView!: HeaderButtonsView;
    private _errorView!: ErrorView;
    private _traceView!: TraceView;

    /*
     * Class setup
     */
    public constructor() {

        (window as any).$ = $;
        this._isLoaded = false;
        this._setupCallbacks();
    }

    /*
     * The entry point for the SPA
     */
    public async execute(): Promise<void> {

        try {
            // Start listening for hash changes
            window.onhashchange = this._onHashChange;

            // Do the initial render
            this._initialRender();

            // Do one time app initialisation
            await this._initialiseApp();

            // We must be prepared for page invocation to be an OAuth login response
            await this._handleLoginResponse();

            // Try to show OAuth user info for the UI
            await this._renderUserInfo();

            // Execute the main view at the current hash location, which will call our API
            await this._runPage();

        } catch (e) {

            // Render the error view if there are problems
            this._errorView.report(e);
        }
    }

    /*
     * Render views in their initial state
     */
    private _initialRender() {

        this._titleView = new TitleView();
        this._titleView.load();

        this._headerButtonsView = new HeaderButtonsView(this._onHome, this._onExpireToken, this._onRefreshData);
        this._headerButtonsView.load();

        this._errorView = new ErrorView();
        this._errorView.load();

        this._traceView = new TraceView();
        this._traceView.load();
    }

    /*
     * Initialise the app
     */
    private async _initialiseApp(): Promise<void> {

        // Download application configuration
        this._configuration = await ConfigurationLoader.download('spa.config.json');

        // Initialise our OIDC Client wrapper and start listening for OIDC messages
        this._authenticator = new Authenticator(this._configuration.oauth);
        this._traceListener = new TraceListener();

        // Create a client to reliably call the API
        this._apiClient = new ApiClient(this._configuration.app.apiBaseUrl, this._authenticator);

        // Our simple router passes the API Client instance between views
        this._router = new Router(this._apiClient, this._errorView);
    }

    /*
     * Handle login responses on page load so that we have tokens and can call APIs
     */
    private async _handleLoginResponse(): Promise<void> {

        await this._authenticator.handleLoginResponse();
    }

    /*
     * Get user info after logging in
     */
    private async _renderUserInfo(): Promise<void> {

        await this._titleView.loadUserInfo(this._authenticator);
    }

    /*
     * Once login processing has completed, start listening for hash changes
     */
    private async _runPage(): Promise<void> {

        this._isLoaded = false;
        await this._router.loadView();
        this._isLoaded = true;
    }

    /*
     * Change the view based on the hash URL and catch errors
     */
    private async _onHashChange(): Promise<void> {

        // Handle updates to log levels when the URL log setting is changed
        this._traceListener.updateLogLevelIfRequired();

        try {
            // Try to change view
            await this._router.loadView();

        } catch (e) {

            // Report failures
            this._errorView.report(e);
        }
    }

    /*
     * Return home and support retrying after errors
     */
    private _onHome(): void {

        location.hash = '#';

        // Force a full reload if not loaded
        if (!this._isLoaded) {
            location.reload();
        }
    }

    /*
     * Force data reload
     */
    private async _onRefreshData(): Promise<void> {

        try {
            // Try to reload data
            await this._router.loadView();

        } catch (e) {

            // Report failures
            this._errorView.report(e);
        }
    }

    /*
     * Force a new access token to be retrieved
     */
    private async _onExpireToken(): Promise<void> {
        await this._authenticator.expireAccessToken();
    }

    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    private _setupCallbacks(): void {
        this._initialiseApp = this._initialiseApp.bind(this);
        this._handleLoginResponse = this._handleLoginResponse.bind(this);
        this._renderUserInfo = this._renderUserInfo.bind(this);
        this._runPage = this._runPage.bind(this);
        this._onHashChange = this._onHashChange.bind(this);
        this._onHome = this._onHome.bind(this);
        this._onRefreshData = this._onRefreshData.bind(this);
        this._onExpireToken = this._onExpireToken.bind(this);
   }
}

/*
 * Run the application
 */
const app = new App();
app.execute();
