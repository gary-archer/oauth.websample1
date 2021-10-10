import cors from 'cors';
import {Application, NextFunction, Request, Response} from 'express';
import {Configuration} from '../configuration/configuration';
import {ApiController} from '../controller/apiController';
import {ApiLogger} from '../logging/apiLogger';
import {WebStaticContent} from './webStaticContent';

/*
 * Configure behaviour of the HTTP server during application startup
 */
export class HttpServerConfiguration {

    private readonly _expressApp: Application;
    private readonly _configuration: Configuration;
    private readonly _apiLogger: ApiLogger;
    private readonly _apiController: ApiController;
    private readonly _webStaticContent: WebStaticContent;

    public constructor(expressApp: Application, configuration: Configuration, logger: ApiLogger) {
        this._expressApp = expressApp;
        this._configuration = configuration;
        this._apiLogger = logger;
        this._apiController = new ApiController(this._configuration);
        this._webStaticContent = new WebStaticContent();
    }

    /*
     * Set up Web API routes to point to the API controller
     */
    public async initializeApi(): Promise<void> {

        // Manage common headers returned in API responses
        const corsOptions = { origin: this._configuration.api.trustedOrigins };
        this._expressApp.use('/api/*', cors(corsOptions) as any);
        this._expressApp.use('/api/*', this._apiController.onWriteHeaders);

        // All API requests undergo logging and authorization
        this._expressApp.use('/api/*', this._catch(this._apiLogger.logRequest));
        this._expressApp.use('/api/*', this._catch(this._apiController.authorizationHandler));

        // API routes containing business logic
        this._expressApp.get('/api/companies', this._catch(this._apiController.getCompanyList));
        this._expressApp.get(
            '/api/companies/:id/transactions',
            this._catch(this._apiController.getCompanyTransactions));

        // Handle failure scenarios
        this._expressApp.use('/api/*', this._apiController.onRequestNotFound);
        this._expressApp.use('/api/*', this._apiController.onException);
    }

    /*
     * Set up listening for web content
     */
    public initializeWebStaticContentHosting(): void {

        this._expressApp.get('/spa/*', this._webStaticContent.getWebResource);
        this._expressApp.get('/spa', this._webStaticContent.getWebDefaultResource);
        this._expressApp.get('/favicon.ico', this._webStaticContent.getFavicon);
    }

    /*
     * Start serving requests
     */
    public startListening(): void {

        this._expressApp.listen(this._configuration.api.port, () => {
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
