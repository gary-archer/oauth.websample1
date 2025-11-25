import {Response} from 'express';
import {ClientError} from '../../logic/errors/clientError.js';

/*
 * Helper methods to write the response
 */
export class ResponseWriter {

    /*
     * Return data to the caller
     */
    public static writeSuccessResponse(response: Response, statusCode: number, data: any): void {

        response.setHeader('content-type', 'application/json');
        response.status(statusCode).send(JSON.stringify(data));
    }

    /*
     * This blog's examples use a JSON response to provide client friendly OAuth errors
     */
    public static writeErrorResponse(response: Response, error: ClientError): void {

        // Add the standard header for interoperability
        if (error.getStatusCode() === 401) {
            response.setHeader(
                'www-authenticate',
                `Bearer error="${error.getStatusCode()}", error_description="${error.message}"`);
        }

        response.setHeader('content-type', 'application/json');
        response.status(error.getStatusCode()).send(JSON.stringify(error.toResponseFormat()));
    }
}
