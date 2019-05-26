/*
 * Token validation
 */

'use strict';
const OpenIdClient = require('openid-client');
const TunnelAgent = require('tunnel-agent');
const Url = require('url');
const ErrorHandler = require('./errorHandler');


/*
 * This handles debugging to Fiddler or Charles so that we can view the introspection request
 */
if (process.env.HTTPS_PROXY) {
    
    const opts = Url.parse(process.env.HTTPS_PROXY);
    OpenIdClient.Issuer.defaultHttpOptions = {
        agent: TunnelAgent.httpsOverHttp({
            proxy: opts
        })
    };
}

/*
 * A class to handle validating tokens received by the API
 */
class Authenticator {
    
    /*
     * Receive the request and response
     */
    constructor(apiConfig) {
        this.apiConfig = apiConfig;
    }

    /*
     * Handle validating an access token received by the API
     */
    validateAccessToken(authorizationHeader) {

        // Get the received access token
        const accessToken = this._readBearerToken(authorizationHeader);
        if (!accessToken) {
            return Promise.reject(ErrorHandler.getNoTokenError());
        }

        // Create the Open Id Client issuer
        const issuer = new OpenIdClient.Issuer({
            introspection_endpoint: this.apiConfig.oauth.introspection_url
        });

        // Create the Authorization Server client
        const client = new issuer.Client({
            client_id: this.apiConfig.oauth.client_id,
            client_secret: this.apiConfig.oauth.client_secret
        });

        // Use it to do the introspection
        return client.introspect(accessToken)
            .then(data => {

                if (!data.active) {

                    // Return a 401 if the token is no longer active
                    return Promise.reject(ErrorHandler.getTokenExpiredError());
                }
                else {
                    
                    // If the token is valid then update claims
                    const claims = {
                        userId: data.sub,
                        clientId: data.cid,
                        scope: data.scope
                    }
                    
                    // Provide claims to the API's business operation
                    return Promise.resolve(claims);
                }
            })
            .catch(error => {

                // Return a 500 if there is an unexpected failure
                return Promise.reject(ErrorHandler.getIntrospectionError(error));
            });
    }

    /*
     * Read the token from the authorization header
     */
    _readBearerToken(authorizationHeader) {
    
        if (authorizationHeader) {
            const parts = authorizationHeader.split(' ');
            if (parts.length === 2 && parts[0] === 'Bearer') {
                return parts[1];
            }
        }

        return null;
    }
}

module.exports = Authenticator;