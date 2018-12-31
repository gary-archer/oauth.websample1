'use strict';
import Authenticator from 'authenticator';
import ErrorHandler from 'errorHandler';
import $ from 'jquery';

/*
 * Logic related to making HTTP calls
 */
export default class HttpClient {
    
    /*
     * Get JSON data from the app config file
     */
    loadAppConfiguration(filePath) {
        
        return $.ajax({
                url: filePath,
                type: 'GET',
                dataType: 'json',
                cache: false
            })
            .catch(xhr => {
                let errorText = ErrorHandler.ajaxErrorToString(xhr, filePath);
                return Promise.reject(errorText);
            });
    }
    
    /*
     * Get data from an API URL and handle retries if needed
     */
    callApi(url, method, dataToSend, authenticator) {

        // Get a token
        return authenticator.getCurrentAccessToken()
            .then(token => {

                // Call the API
                return HttpClient._callApiWithToken(url, method, dataToSend, token)
                    .then (data => {
                        
                        // Return data if successful
                        return Promise.resolve(data);
                    })
                    .catch (xhr1 => {

                        // Report erors other than 401
                        if (xhr1.status !== 401) {
                            let ajaxError = ErrorHandler.ajaxErrorToString(xhr1, url);
                            return Promise.reject(ajaxError);
                        }

                        // Get a new token
                        return authenticator.getNewAccessToken()
                            .then(token => {

                                // Call the API again
                                return HttpClient._callApiWithToken(url, method, dataToSend, token)
                                    .then(data => {
                
                                        // Return data if successful
                                        return Promise.resolve(data);
                                    })
                                    .catch(xhr2 => {

                                        // Report erors
                                        let ajaxError = ErrorHandler.ajaxErrorToString(xhr2, url);
                                        return Promise.reject(ajaxError);
                                    });
                            });
                    });
            });
    }

    /*
     * Do the work of calling the API
     */
    static _callApiWithToken(url, method, dataToSend, accessToken) {
        
        return $.ajax({
                url: url,
                data: JSON.stringify(dataToSend | {}),
                dataType: 'json',
                contentType: 'application/json',
                type: method,
                beforeSend: function (xhr) {
                    if (accessToken) {
                        xhr.setRequestHeader ('Authorization', 'Bearer ' + accessToken);
                    }
                }
            });
    }
}
