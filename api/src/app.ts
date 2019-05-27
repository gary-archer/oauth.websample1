import * as express from 'express';
import * as fs from 'fs-extra';
import {Configuration} from './configuration/configuration';
import {ErrorHandler} from './plumbing/errors/errorHandler';
import {ApiLogger} from './plumbing/utilities/apiLogger';
import {DebugProxyAgent} from './plumbing/utilities/debugProxyAgent';
import {HttpServerConfiguration} from './startup/httpServerConfiguration';

(async () => {

    // Initialize diagnostics
    ApiLogger.initialize();
    DebugProxyAgent.initialize();

    try {

        // First load configuration
        const apiConfigBuffer = fs.readFileSync('api.config.json');
        const apiConfig = JSON.parse(apiConfigBuffer.toString()) as Configuration;

        // Next configure web server behaviour
        const expressApp = express();
        const httpServer = new HttpServerConfiguration(expressApp, apiConfig);
        await httpServer.initializeApi();

        // We will also host web static content
        httpServer.initializeWebStaticContentHosting();

        // Start receiving requests
        httpServer.startListening();

    } catch (e) {

        // Report startup errors
        const error = ErrorHandler.fromException(e);
        ApiLogger.error(JSON.stringify(error.toLogFormat()));
    }
})();
