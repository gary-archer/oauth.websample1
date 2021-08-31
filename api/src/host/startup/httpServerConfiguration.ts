import cors from 'cors';
import {Application, NextFunction, Request, Response} from 'express';
import {Configuration} from '../configuration/configuration';
import {Router} from '../routing/router';
import {ApiLogger} from '../utilities/apiLogger';
import {WebStaticContent} from './webStaticContent';

/*
 * Configure behaviour of the HTTP server during application startup
 */
export class HttpServerConfiguration {

    private readonly _expressApp: Application;
    private readonly _configuration: Configuration;
    private readonly _router: Router;
    private readonly _webStaticContent: WebStaticContent;

    public constructor(expressApp: Application, configuration: Configuration) {
        this._expressApp = expressApp;
        this._configuration = configuration;
        this._router = new Router(this._configuration);
        this._webStaticContent = new WebStaticContent();
    }

    /*
     * Set up Web API routes and initialize the API
     */
    public async initializeApi(): Promise<void> {

        // Allow cross origin requests from the SPA and disable API response caching
        const corsOptions = { origin: this._configuration.api.trustedOrigins };
        this._expressApp.use('/api/*', cors(corsOptions) as any);
        this._expressApp.use('/api/*', this._router.cacheHandler);

        // All API requests are authorized first
        this._expressApp.use('/api/*', this._catch(this._router.authorizationHandler));

        // API routes containing business logic
        this._expressApp.get('/api/companies', this._catch(this._router.getCompanyList));
        this._expressApp.get('/api/companies/:id/transactions', this._catch(this._router.getCompanyTransactions));

        // Handle failure scenarios
        this._expressApp.use('/api/*', this._router.notFoundHandler);
        this._expressApp.use('/api/*', this._router.unhandledExceptionHandler);

        // Prepare the API to handle secured requests
        await this._router.initialize();
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
            ApiLogger.info(`API is listening on HTTP port ${this._configuration.api.port}`);
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
                    this._router.unhandledExceptionHandler(e, request, response);
                });
        };
    }
}
