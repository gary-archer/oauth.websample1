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

    private readonly express: Application;
    private readonly configuration: Configuration;
    private readonly apiLogger: ApiLogger;
    private readonly apiController: ApiController;

    public constructor(expressApp: Application, configuration: Configuration, logger: ApiLogger) {

        this.express = expressApp;
        this.configuration = configuration;
        this.apiLogger = logger;
        this.apiController = new ApiController(this.configuration);
    }

    /*
     * Set up Web API routes and middleware
     */
    public async initializeApi(): Promise<void> {

        // Grant API access to the web origin
        const corsOptions = {
            origin: this.configuration.api.trustedOrigins,
            maxAge: 86400,
        };
        this.express.use('/api/*_', cors(corsOptions) as any);
        this.express.use('/api/*_', this.apiController.onWriteHeaders);

        // Add cross cutting concerns for logging, error handling and security
        this.express.use('/api/*_', this.apiLogger.logRequest);
        this.express.use('/api/*_', this.apiController.authorizationHandler);

        // API routes containing business logic
        this.express.get('/api/companies', this.apiController.getCompanyList);
        this.express.get(
            '/api/companies/:id/transactions',
            this.apiController.getCompanyTransactions);

        // Handle errors after routes are defined
        this.express.use('/api/*_', this.apiController.onException);
        this.express.use('/api/*_', this.apiController.onRequestNotFound);
    }

    /*
     * For code sample simplicity, the API serves web content, though a real API would not do this
     */
    public initializeWebStaticContentHosting(): void {

        this.express.use('/spa', express.static('../spa'));
        this.express.use('/favicon.ico', express.static('../spa/favicon.ico'));
    }

    /*
     * Start serving requests
     */
    public startListening(): void {

        this.express.listen(this.configuration.api.port, () => {
            console.log(`API is listening on HTTP port ${this.configuration.api.port}`);
        });
    }
}
