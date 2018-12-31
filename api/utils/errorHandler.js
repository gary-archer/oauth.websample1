/*
 * Error handling module
 */

'use strict';
const AppLogger = require('./appLogger');

/*
 * A class to handle validating tokens received by the API
 */
class ErrorHandler {
    
    /*
     * Handle logging the error to the service and returning an error to the client
     */
    static handleOAuthError(serverError) {
        
        // Log details to the service
        AppLogger.warn('OAuth Error', JSON.stringify(serverError));

        // Return details to the client
        return {
            statusCode: serverError.statusCode,
            error: {
                status: serverError.status,
                message: serverError.message
            }
        };
    }

    /*
     * Handle logging the exception to the service and returning an error to the client
     */
    static handleException(exception) {

        // Log details to the service
        let serverError = {
            statusCode: 500,
            status: 'ServerError',
            message: 'Problem Encountered',
            details: exception.toString()
        };
        AppLogger.error('Exception', JSON.stringify(serverError));

        // Return client error details
        return {
            statusCode: serverError.statusCode,
            error: {
                status: serverError.status,
                message: serverError.message
            }
        };
    }

    /*
     * Report missing token errors to service and client
     */
    static getNoTokenError() {
        
        return {
            statusCode: 401,
            status: 'Unauthorized',
            message: 'No token was found in the Authorization header'
        };
    }

    /*
     * Report expired token errors to service and client
     */
    static getTokenExpiredError() {
        
        return {
            statusCode: 401,
            status: 'Unauthorized',
            message: 'The received token has expired'
        };
    }
    
    /*
     * Report request errors to service and client
     */
    static getIntrospectionError(responseError) {
        
        // Already handled expired errors
        if (responseError.status && responseError.statusCode === 401) {
            return responseError;
        }
        
        let error = {
            statusCode: 500,
            status: 'ServerError',
            message: 'Token introspection call failed',
            details: responseError
        };
        
        return error;
    }
}

module.exports = ErrorHandler;