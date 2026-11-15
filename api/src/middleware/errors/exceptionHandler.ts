import {Response} from 'express';
import {LogEntry} from '../logging/logEntry.js';
import {ClientError} from './clientError.js';
import {ErrorFactory} from './errorFactory.js';
import {ServerError} from './serverError.js';

/*
 * A class to handle trapping errors
 */
export class ExceptionHandler {

    /*
     * Handle the server error and return an error to the caller
     */
    public static handleError(exception: any, response: Response): ClientError {

        const handledError = ErrorFactory.fromException(exception);
        if (exception instanceof ClientError) {

            // Log the error and return the error to the caller
            const clientError = handledError as ClientError;
            const logEntry = response.locals.logEntry as LogEntry;
            logEntry.setError(clientError);
            return clientError;

        } else {

            // Log the error and returning the error to the caller
            const serverError = handledError as ServerError;
            const logEntry = response.locals.logEntry as LogEntry;
            logEntry.setError(serverError);
            return serverError.toClientError();
        }
    }
}
