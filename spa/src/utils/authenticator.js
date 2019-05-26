'use strict';
import {UserManager as OidcUserManager} from 'oidc-client';
import {Log as OidcLog} from 'oidc-client';
import Crypto from 'crypto';
import OAuthLogger from 'oauthLogger';

/*
 * The entry point for initiating login and token requests
 */
export default class Authenticator {
    
    /*
     * Class setup
     */
    constructor(config) {
        
        // Create OIDC settings from our application configuration
        const settings = {
            authority: config.authority,
            client_id: config.client_id,
            redirect_uri: config.redirect_uri,
            scope: config.scope,
            
            // Initially we'll use this flow for simplicity
            response_type: 'token',
            
            // Disable these features which we are not using
            loadUserInfo: false,
            monitorSession: false,
            automaticSilentRenew: false
        };
        
        // Initialise OIDC
        this.userManager = new OidcUserManager(settings);
        OAuthLogger.initialize(OidcLog.DEBUG);
        this._setupCallbacks();
    }

    /*
     * Return the current access token or null
     */
    getCurrentAccessToken() {

        return this.userManager.getUser()
            .then(user => {

                // See if a token exists in HTML5 storage
                if (user && user.access_token) {
                    return user.access_token;
                };

                return null;
            });
    }
    
    /*
     * Get a new access token and login if required
     */
    getNewAccessToken() {
        
        // Store the SPA's client side location
        const data = {
            hash: location.hash.length > 0 ? location.hash : '#'
        };
        
        // Use the lower level method to get the URL
        return this.userManager.createSigninRequest({state: JSON.stringify(data)})
            .then(request => {

                // Okta requires a nonce parameter with response_type=token so generate one before redirecting
                const nonce = this._generateNonce();
                request.url += `&nonce=${nonce}`;

                // Pause to see all log output before redirecting
                setTimeout(() => {
                    alert('Authenticator: pausing before login redirect');
                    location.replace(request.url);

                }, 100);
            
                return Promise.reject('login_required');
            });
    }
    
    /*
     * Handle the response from logging in if required
     */
    handleLoginResponse() {
        
        // Check there is an OAuth response to process
        if (location.hash.indexOf('state') === -1) {
            return Promise.resolve();
        }

        return this.userManager.signinRedirectCallback()
            .then(response => {

                // Get the hash URL before the redirect
                const data = JSON.parse(response.state);

                // Replace the browser location, to prevent tokens being available during back navigation
                history.replaceState({}, document.title, data.hash);
                return Promise.resolve();
            });
    }

    /*
     * Generate a nonce since Okta requires one with response type=token but OIDC Client does not supply one
     */
    _generateNonce() {
        return Crypto.randomBytes(16)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    }

    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    _setupCallbacks() {
        this.getCurrentAccessToken = this.getCurrentAccessToken.bind(this);
        this.getNewAccessToken = this.getNewAccessToken.bind(this);
        this.handleLoginResponse = this.handleLoginResponse.bind(this);
    }
}