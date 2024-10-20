import {ClientError} from '../../logic/errors/clientError.js';
import {ErrorCodes} from '../../logic/errors/errorCodes.js';
import {ServerError} from '../../logic/errors/serverError.js';

/*
 * A class to handle extracting information and creating errors
 */
export class ErrorFactory {

    /*
     * Ensure that all errors used by business logic have a known type
     */
    public static fromException(exception: any): ServerError | ClientError {

        // Already handled 500 errors
        if (exception instanceof ServerError) {
            return exception;
        }

        // Already handled 4xx errors
        if (exception instanceof ClientError) {
            return exception;
        }

        // Handle general exceptions
        return ErrorFactory.fromServerError(exception);
    }

    /*
     * Process exception details
     */
    public static fromServerError(exception: any): ServerError {

        const serverError = new ServerError(
            ErrorCodes.serverError,
            'An unexpected exception occurred in the API',
            exception.stack);
        serverError.setDetails(this._getExceptionDetails(exception));
        return serverError;
    }

    /*
     * Handle requests to API routes that don't exist
     */
    public static fromRequestNotFound(): ClientError {

        return new ClientError(
            404,
            ErrorCodes.requestNotFound,
            'An API request was sent to a route that does not exist');
    }

    /*
     * JWKS download errors result in a 500 error response
     */
    public static fromJwksDownloadError(exception: any): ServerError | ClientError {

        const details = {} as any;
        if (exception.code) {
            details.code = exception.code;
            details.description = this._getExceptionDetails(exception);
        }

        const serverError = new ServerError(
            ErrorCodes.jwksDownloadError,
            'Problem downloading token signing keys',
            exception.stack);
        serverError.setDetails(details);
        return serverError;
    }

    /*
     * Token validation errors result in a 401 response due to the client not sending a valid token
     */
    public static fromMissingTokenError(): ClientError {

        const clientError = new ClientError(
            401,
            ErrorCodes.invalidToken,
            'Missing, invalid or expired access token');

        clientError.setLogContext({
            description: 'No bearer token was supplied in the Authorization header'
        });

        return clientError;
    }

    /*
     * Token validation errors result in a 401 response due to the client not sending a valid token
     */
    public static fromTokenValidationError(exception: any): ServerError | ClientError {

        if (exception instanceof ServerError) {
            return exception;
        }

        if (exception instanceof ClientError) {
            return exception;
        }

        const details = {} as any;
        if (exception.code) {
            details.code = exception.code;
            details.description = this._getExceptionDetails(exception);
        }

        const clientError = new ClientError(
            401,
            ErrorCodes.invalidToken,
            'Missing, invalid or expired access token');
        clientError.setLogContext(details);
        return clientError;
    }

    /*
     * The error thrown if we cannot find an expected claim during OAuth processing
     */
    public static fromMissingClaim(claimName: string): ServerError {

        const serverError = new ServerError(ErrorCodes.claimsFailure, 'Authorization Data Not Found');
        serverError.setDetails(`An empty value was found for the expected claim ${claimName}`);
        return serverError;
    }

    /*
     * Get the message from an exception and avoid returning [object Object]
     */
    private static _getExceptionDetails(e: any): string {

        if (e.message) {
            return e.message;
        }

        const details = e.toString();
        if (details !== {}.toString()) {
            return details;
        }

        return '';
    }
}
