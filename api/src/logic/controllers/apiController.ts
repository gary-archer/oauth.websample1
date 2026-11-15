import {NextFunction, Request, Response} from 'express';
import onHeaders from 'on-headers';
import {Configuration} from '../../configuration/configuration.js';
import {ClientError} from '../../middleware/errors/clientError.js';
import {ErrorCodes} from '../../middleware/errors/errorCodes.js';
import {ErrorFactory} from '../../middleware/errors/errorFactory.js';
import {ExceptionHandler} from '../../middleware/errors/exceptionHandler.js';
import {AccessTokenValidator} from '../../middleware/oauth/accessTokenValidator.js';
import {JwksRetriever} from '../../middleware/oauth/jwksRetriever.js';
import {HttpProxy} from '../../utilities/httpProxy.js';
import {JsonFileReader} from '../../utilities/jsonFileReader.js';
import {ResponseWriter} from '../../utilities/responseWriter.js';
import {CompanyRepository} from '../repositories/companyRepository.js';
import {CompanyService} from '../services/companyService.js';

/*
 * Entry point handling for API requests
 */
export class ApiController {

    private readonly accessTokenValidator: AccessTokenValidator;

    public constructor(configuration: Configuration) {

        const httpProxy = new HttpProxy(configuration);
        const jwksRetriever = new JwksRetriever(configuration.oauth, httpProxy);
        this.accessTokenValidator = new AccessTokenValidator(configuration.oauth, jwksRetriever);
        this.setupCallbacks();
    }

    /*
     * Validate the received JWT on every request, then trust the claims contained
     */
    public async authorizationHandler(
        request: Request,
        response: Response,
        next: NextFunction): Promise<void> {

        const claims = await this.accessTokenValidator.execute(request);
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
        ResponseWriter.writeSuccessResponse(response, 200, result);
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
        const id = parseInt(request.params.id as string, 10);
        if (isNaN(id) || id <= 0) {
            throw new ClientError(
                400,
                ErrorCodes.invalidCompanyId,
                'The company id must be a positive numeric integer');
        }

        const result = await service.getCompanyTransactions(id);
        ResponseWriter.writeSuccessResponse(response, 200, result);
    }

    /*
     * Remove the ETag header from API responses
     */
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
        ResponseWriter.writeErrorResponse(response, clientError);
    }

    /*
     * Handle exceptions thrown by the API, by logging the error and returning a client response
     */
    public onException(
        unhandledException: any,
        request: Request,
        response: Response,
        next: NextFunction): void {

        const clientError = ExceptionHandler.handleError(unhandledException, response);
        ResponseWriter.writeErrorResponse(response, clientError);
    }

    /*
     * Set up async callbacks
     */
    private setupCallbacks(): void {
        this.authorizationHandler = this.authorizationHandler.bind(this);
        this.getCompanyList = this.getCompanyList.bind(this);
        this.getCompanyTransactions = this.getCompanyTransactions.bind(this);
    }
}
