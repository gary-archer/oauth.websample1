'use strict';
import $ from 'jquery';

/*
 * Logic related to error handling and clear error messages
 */
export default class ErrorHandler {
    
	/*
	 * Produce a readable ajax error and handle CORS errors where a zero status is returned
	 */
	static ajaxErrorToString(xhr, url) {

        if (xhr.status === 0 ) {
            return `Error calling URL: ${url} : cross origin request denied`;
        }
        else if (xhr.status === 200 ) {
            return `Error parsing JSON returned from URL: ${url}`;
        }
        else {        
            return `Error calling URL: ${url}, Status Code: ${xhr.status}`;
        }
	}
    
    /*
     * Output error details
     */
    static reportError(error) {
        
        if (error !== 'login_required') {
            $('#error').text(ErrorHandler._getErrorText(error));
        }
    }
    
    /*
     * Get display text for an error
     */
    static _getErrorText(error) {
        let errorText = '';
        
        if (error.error && error.error_description) {
            errorText = `Code: ${error.error}, Description: ${error.error_description}`;
        }
        else if (error instanceof Error) {
            errorText = ErrorHandler._sanitizeErrorMessage(error.message);
        }
        else {
            errorText = ErrorHandler._sanitizeErrorMessage(error);
        }
        
        return `ERROR: ${errorText}`;
    }
    
    /*
     * Ensure supportable error messages
     */
    static _sanitizeErrorMessage(message) {
        if (message === 'Network Error') {
           return  'Cross origin request to Authorization Server failed - please check configuration'
        }
        
        return message;
    }
}