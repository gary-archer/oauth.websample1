import cors from 'cors';
import express from 'express';
import {Application, NextFunction, Request, Response} from 'express';
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
        this._express.use('/api/*', cors(corsOptions) as any);
        this._express.use('/api/*', this._apiController.onWriteHeaders);

        // All API requests undergo logging and authorization
        this._express.use('/api/*', this._catch(this._apiLogger.logRequest));
        this._express.use('/api/*', this._catch(this._apiController.authorizationHandler));

        // API routes containing business logic
        this._express.get('/api/companies', this._catch(this._apiController.getCompanyList));
        this._express.get(
            '/api/companies/:id/transactions',
            this._catch(this._apiController.getCompanyTransactions));

        // Handle failure scenarios
        this._express.use('/api/*', this._apiController.onRequestNotFound);
        this._express.use('/api/*', this._apiController.onException);
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

    /*
     * Deal with Express unhandled promise exceptions during async API requests
     * https://medium.com/@Abazhenov/using-async-await-in-express-with-node-8-b8af872c0016
     */
    private _catch(fn: any): any {

        return (request: Request, response: Response, next: NextFunction) => {

            Promise
                .resolve(fn(request, response, next))
                .catch((e) => {
                    this._apiController.onException(e, request, response);
                });
        };
    }
}
