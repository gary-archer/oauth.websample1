'use strict';
import Authenticator from 'authenticator';
import HttpClient from 'httpClient';
import ErrorHandler from 'errorHandler';
import $ from 'jquery';

/*
 * The application class
 */
class App {
    
    /*
     * Class setup
     */
    constructor() {
        // Create class members
        this.appConfig = null;
        this.authenticator = null;
        this._setupCallbacks();
    }
    
    /*
     * The entry point for the SPA
     */
    execute() {
        
        // Download configuration, then handle login, then run the page workflow
        this._requestAppConfig()
            .then(this._receiveAppConfig)
            .then(this._configureAuthentication)
            .then(this._handleLoginResponse)
            .then(this._requestPageData)
            .then(this._receivePageData)
            .catch(e => { ErrorHandler.reportError(e); });
    }
    
    /*
     * Start the download of application configuration
     */
    _requestAppConfig()  {
        let httpClient = new HttpClient();
        return httpClient.loadAppConfiguration('spa.config.json');
    }
    
    /*
     * Receive the application configuration
     */
    _receiveAppConfig(downloadedConfig) {
        this.appConfig = downloadedConfig;
        return Promise.resolve();
    }
    
    /*
     * Point OIDC logging to our application logger and then supply OAuth settings
     */
    _configureAuthentication() {
        this.authenticator = new Authenticator(this.appConfig.oauth);
    }
    
    /*
     * Handle login responses if applicable
     */
    _handleLoginResponse() {
        return this.authenticator.handleLoginResponse();
    }
    
    /*
     * Start the request for the page data
     */
    _requestPageData() {
        let httpClient = new HttpClient();
        return httpClient.callApi(`${this.appConfig.app.api_base_url}/data`, 'GET', null, this.authenticator);
    }
    
    /*
     * Receive the page data and render it
     */
    _receivePageData(dataFromApi) {
        $('#data').text(dataFromApi.message);
    }

    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    _setupCallbacks() {
        this._receiveAppConfig = this._receiveAppConfig.bind(this);
        this._configureAuthentication = this._configureAuthentication.bind(this);
        this._handleLoginResponse = this._handleLoginResponse.bind(this);
        this._requestPageData = this._requestPageData.bind(this);
   }
}

/*
 * Start the application
 */
let app = new App();
app.execute();