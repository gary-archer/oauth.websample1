/*
 * A primitive HTTP server whose main roles is a REST API
 */

'use strict';
const express = require('express');
const cors = require('cors');
const path = require('path');
const apiConfig = require('./api.config.json');
const webFilesRoot = '../spa';

// Import our class definitions
const Authenticator = require('./utils/authenticator');
const ErrorHandler = require('./utils/errorHandler');
const AppLogger = require('./utils/appLogger');

/*
 * INITIAL SETUP
 */
const app = express();
AppLogger.initialize('info');

/*
 * PRIMITIVE WEB SERVER (http://mycompanyweb.com)
 * Serves web content and uses index.html as the default document
 */
app.get('/spa/*', function (request, response) {
	
    let resourcePath = request.path.replace('spa/', '');
    if (resourcePath === '/') {
	      resourcePath = 'index.html';
    }
    
    let webFilePath = path.join(`${__dirname}/${webFilesRoot}/${resourcePath}`);
    response.sendFile(webFilePath);
});

app.get('/spa', function (request, response) {
    let webFilePath = path.join(`${__dirname}/${webFilesRoot}/index.html`);
    response.sendFile(webFilePath);
});

app.get('/favicon.ico', function (request, response) {
    let webFilePath = path.join(`${__dirname}/${webFilesRoot}/favicon.ico`);
    response.sendFile(webFilePath);
});

/*
 * PRIMITIVE API (http://mycompanyapi.com)
 * Allows Javascript access from our web domain, verifies tokens, then returns data
 */
const corsOptions = { origin: apiConfig.app.trusted_origins };
app.use('/api/*', cors(corsOptions));

app.use('/api/*', function (request, response, next) {
    
    AppLogger.info('API call', 'Validating token and getting claims');

    // Do token validation
    let authenticator = new Authenticator(apiConfig);
    authenticator.validateAccessToken(request.header('authorization'))
        .then(claims => {
        
            // Set resulting claims and move to the API operation
            response.locals.claims = claims;
            next();
        })
        .catch(error => {
            
            // Handle failed tokens
            let clientInfo = ErrorHandler.handleOAuthError(error);
            response.status(clientInfo.statusCode).send(JSON.stringify(clientInfo.error));
        });
});

app.get('/api/*', function (request, response, next) {
    
    AppLogger.info('API call', 'Running API operation with processed claims');

    // Set the response data
    response.setHeader('Content-Type', 'application/json');
    let datetime = new Date().toLocaleTimeString();
    let data = {
        message: `API call from user ${response.locals.claims.userId} at ${datetime}`
    };
    response.end(JSON.stringify(data));
});

app.use('/api/*', function (unhandledException, request, response, next) {
    
    AppLogger.info('API call', `Unhandled exception: ${unhandledException}`);

    // Handle exceptions
    let clientInfo = ErrorHandler.handleException(unhandledException);
    response.status(clientInfo.statusCode).send(JSON.stringify(clientInfo.error));
});

/*
 * START LISTENING FOR HTTP REQUESTS
 */
app.listen(apiConfig.app.port, function () {
    AppLogger.info('HTTP server', `Listening on port ${apiConfig.app.port}`);
});
