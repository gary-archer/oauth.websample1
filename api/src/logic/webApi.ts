import {NextFunction, Request, Response} from 'express';
import {Configuration} from '../configuration/configuration';
import {ClientError} from '../plumbing/errors/clientError';
import {ErrorHandler} from '../plumbing/errors/errorHandler';
import {Authenticator} from '../plumbing/oauth/authenticator';
import {IssuerMetadata} from '../plumbing/oauth/issuerMetadata';
import {JsonFileReader} from '../plumbing/utilities/jsonFileReader';
import {ResponseWriter} from '../plumbing/utilities/responseWriter';
import {CompanyController} from './companyController';
import {CompanyRepository} from './companyRepository';

/*
 * This presents an overview of our overall API behaviour and deals with Express's request and response objects
 */
export class WebApi {

    /*
     * Dependencies
     */
    private _apiConfig: Configuration;
    private _issuerMetadata: IssuerMetadata;

    /*
     * API construction
     */
    public constructor(apiConfig: Configuration) {

        this._apiConfig = apiConfig;
        this._issuerMetadata = new IssuerMetadata(this._apiConfig.oauth);
        this._setupCallbacks();
    }

    /*
     * Load Open Id Connect metadata at application startup
     */
    public async initialize(): Promise<void> {
        await this._issuerMetadata.load();
    }

    /*
     * The entry point for authorization and claims handling
     */
    public async authorizationHandler(
        request: Request,
        response: Response,
        next: NextFunction): Promise<void> {

        // The first sample does the expensive authentication on every request
        const authenticator = new Authenticator(this._apiConfig.oauth, this._issuerMetadata.metadata);
        const claims = await authenticator.authenticateAndGetClaims(request);

        // On success, set claims against the request context and move on to the controller logic
        response.locals.claims = claims;
        next();
    }

    /*
     * Return a list of companies
     */
    public async getCompanyList(
        request: Request,
        response: Response,
        next: NextFunction): Promise<void> {

        // Create the controller instance and its dependencies on every API request
        const reader = new JsonFileReader();
        const repository = new CompanyRepository(response.locals.claims, reader);
        const controller = new CompanyController(repository);

        // Get the data and return it in the response
        const result = await controller.getCompanyList();
        ResponseWriter.writeObjectResponse(response, 200, result);
    }

    /*
     * Return company transactions
     */
    public async getCompanyTransactions(
        request: Request,
        response: Response,
        next: NextFunction): Promise<void> {

        // Create the controller instance and its dependencies on every API request
        const reader = new JsonFileReader();
        const repository = new CompanyRepository(response.locals.claims, reader);
        const controller = new CompanyController(repository);

        // Get the supplied id as a number, and return 400 if invalid input was received
        const id = parseInt(request.params.id, 10);
        if (isNaN(id) || id <= 0) {
            throw new ClientError(400, 'invalid_company_id', 'The company id must be a positive numeric integer');
        }

        const result = await controller.getCompanyTransactions(id);
        ResponseWriter.writeObjectResponse(response, 200, result);
    }

    /*
     * The entry point for handling exceptions forwards all exceptions to our handler class
     */
    public unhandledExceptionHandler(
        unhandledException: any,
        request: Request,
        response: Response): void {

        const clientError = ErrorHandler.handleError(unhandledException);
        ResponseWriter.writeObjectResponse(response, clientError.statusCode, clientError.toResponseFormat());
    }

    /*
     * Set up async callbacks
     */
    private _setupCallbacks(): void {
        this.authorizationHandler = this.authorizationHandler.bind(this);
        this.getCompanyList = this.getCompanyList.bind(this);
        this.getCompanyTransactions = this.getCompanyTransactions.bind(this);
        this.unhandledExceptionHandler = this.unhandledExceptionHandler.bind(this);
    }
}
