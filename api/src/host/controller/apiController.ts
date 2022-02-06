import {NextFunction, Request, Response} from 'express';
import onHeaders from 'on-headers';
import {ClientError} from '../../logic/errors/clientError';
import {ErrorCodes} from '../../logic/errors/errorCodes';
import {CompanyRepository} from '../../logic/repositories/companyRepository';
import {CompanyService} from '../../logic/services/companyService';
import {JsonFileReader} from '../../logic/utilities/jsonFileReader';
import {Configuration} from '../configuration/configuration';
import {ErrorFactory} from '../errors/errorFactory';
import {ExceptionHandler} from '../errors/exceptionHandler';
import {Authenticator} from '../oauth/authenticator';
import {HttpProxy} from '../utilities/httpProxy';
import {ResponseWriter} from '../utilities/responseWriter';

/*
 * Entry point handling for API requests
 */
export class ApiController {

    private readonly _authenticator: Authenticator;
    private readonly _httpProxy: HttpProxy;

    public constructor(configuration: Configuration) {

        this._httpProxy = new HttpProxy(configuration);
        this._authenticator = new Authenticator(configuration.oauth, this._httpProxy);
        this._setupCallbacks();
    }

    /*
     * Validate the received JWT on every request, then trust the claims contained
     */
    public async authorizationHandler(
        request: Request,
        response: Response,
        next: NextFunction): Promise<void> {

        const claims = await this._authenticator.validateToken(request);
        response.locals.claims = claims;
        next();
    }

    /*
     * Return a list of companies
     */
    public async getCompanyList(request: Request, response: Response): Promise<void> {

        // Create the service instance and its dependencies on every API request
        const reader = new JsonFileReader();
        const repository = new CompanyRepository(reader);
        const service = new CompanyService(repository, response.locals.claims);

        // Get the data and return it in the response
        const result = await service.getCompanyList();
        ResponseWriter.writeObjectResponse(response, 200, result);
    }

    /*
     * Return company transactions
     */
    public async getCompanyTransactions(request: Request, response: Response): Promise<void> {

        // Create the service instance and its dependencies on every API request
        const reader = new JsonFileReader();
        const repository = new CompanyRepository(reader);
        const service = new CompanyService(repository, response.locals.claims);

        // Get the supplied id as a number, and return 400 if invalid input was received
        const id = parseInt(request.params.id, 10);
        if (isNaN(id) || id <= 0) {
            throw new ClientError(
                400,
                ErrorCodes.invalidCompanyId,
                'The company id must be a positive numeric integer');
        }

        const result = await service.getCompanyTransactions(id);
        ResponseWriter.writeObjectResponse(response, 200, result);
    }

    /*
     * Remove the ETag header from API responses
     */
    /* eslint-disable @typescript-eslint/no-unused-vars */
    public onWriteHeaders(
        request: Request,
        response: Response,
        next: NextFunction): void {

        onHeaders(response, () => response.removeHeader('ETag'));
        next();
    }

    /*
     * Handle requests to routes that do not exist, by logging the error and returning a client response
     */
    /* eslint-disable @typescript-eslint/no-unused-vars */
    public onRequestNotFound(
        request: Request,
        response: Response,
        next: NextFunction): void {

        const clientError = ErrorFactory.fromRequestNotFound();
        ExceptionHandler.handleError(clientError, response);

        ResponseWriter.writeObjectResponse(
            response,
            clientError.statusCode,
            clientError.toResponseFormat());
    }

    /*
     * Handle exceptions thrown by the API, by logging the error and returning a client response
     */
    public onException(
        unhandledException: any,
        request: Request,
        response: Response): void {

        const clientError = ExceptionHandler.handleError(unhandledException, response);

        ResponseWriter.writeObjectResponse(
            response,
            clientError.statusCode,
            clientError.toResponseFormat());
    }

    /*
     * Set up async callbacks
     */
    private _setupCallbacks(): void {
        this.authorizationHandler = this.authorizationHandler.bind(this);
        this.getCompanyList = this.getCompanyList.bind(this);
        this.getCompanyTransactions = this.getCompanyTransactions.bind(this);
    }
}
