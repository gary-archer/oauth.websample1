import express from 'express';
import fs from 'fs-extra';
import {Configuration} from '../configuration/configuration.js';
import {ErrorFactory} from '../errors/errorFactory.js';
import {ApiLogger} from '../logging/apiLogger.js';
import {HttpServerConfiguration} from './httpServerConfiguration.js';

const logger = new ApiLogger();
try {

    // First load configuration
    const configJson = await fs.readFile('api.config.json', 'utf8');
    const configuration = JSON.parse(configJson) as Configuration;

    // Set up the main API behaviour
    const expressApp = express();
    const httpServer = new HttpServerConfiguration(expressApp, configuration, logger);
    await httpServer.initializeApi();

    // For demo purposes the API also hosts static web content
    httpServer.initializeWebStaticContentHosting();

    // Start receiving requests
    httpServer.startListening();

} catch (e: any) {

    // Report startup errors
    const error = ErrorFactory.fromServerError(e);
    logger.startupError(error);
}
