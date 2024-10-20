import cors from 'cors';
import express from 'express';
import {Application} from 'express';
import {Configuration} from '../configuration/configuration.js';
import {ApiController} from '../controller/apiController.js';
import {ApiLogger} from '../logging/apiLogger.js';

/*
 * Configure behaviour of the HTTP server during application startup
 */
export class HttpServerConfiguration {

    private readonly _express: Application;
    private readonly _configuration: Configuration;
    private readonly _apiLogger: ApiLogger;
    private readonly _apiController: ApiController;

    public constructor(expressApp: Application, configuration: Configuration, logger: ApiLogger) {

        this._express = expressApp;
        this._configuration = configuration;
        this._apiLogger = logger;
        this._apiController = new ApiController(this._configuration);
    }

    /*
     * Set up Web API routes and middleware
     */
    public async initializeApi(): Promise<void> {

        // Grant API access to the web origin
        const corsOptions = {
            origin: this._configuration.api.trustedOrigins,
            maxAge: 86400,
        };
        this._express.use('/api/*_', cors(corsOptions) as any);
        this._express.use('/api/*_', this._apiController.onWriteHeaders);

        // Add cross cutting concerns for logging, error handling and security
        this._express.use('/api/*_', this._apiLogger.logRequest);
        this._express.use('/api/*_', this._apiController.authorizationHandler);

        // API routes containing business logic
        this._express.get('/api/companies', this._apiController.getCompanyList);
        this._express.get(
            '/api/companies/:id/transactions',
            this._apiController.getCompanyTransactions);

        // Handle errors after routes are defined
        this._express.use('/api/*_', this._apiController.onException);
        this._express.use('/api/*_', this._apiController.onRequestNotFound);
    }

    /*
     * For code sample simplicity, the API serves web content, though a real API would not do this
     */
    public initializeWebStaticContentHosting(): void {

        this._express.use('/spa', express.static('../spa'));
        this._express.use('/favicon.ico', express.static('../spa/favicon.ico'));
    }

    /*
     * Start serving requests
     */
    public startListening(): void {

        this._express.listen(this._configuration.api.port, () => {
            console.log(`API is listening on HTTP port ${this._configuration.api.port}`);
        });
    }
}
