/*
 * Error codes that the UI can program against
 */
export class ErrorCodes {

    // An error code meaning APIs cannot be called until the user re-authenticates
    public static readonly loginRequired = 'login_required';

    // A technical error starting a login request, such as contacting the metadata endpoint
    public static readonly loginRequestFailed = 'login_request_failed';

    // A technical error processing the login response containing the authorization code
    public static readonly loginResponseFailed = 'login_response_failed';

    // A general exception in the UI
    public static readonly generalUIError = 'ui_error';

    // A general fetch error
    public static readonly fetchError = 'fetch_error';

    // An error making a fetch request to get API data
    public static readonly connectionError = 'connection_error';

    // An error receiving API data as JSON
    public static readonly dataError = 'data_error';

    // Returned by the API when the user edits the browser URL to a not found value
    public static readonly companyNotFound = 'company_not_found';

    // Returned by the API when the user edits the browser URL and supplies a non numeric company id
    public static readonly invalidCompanyId = 'invalid_company_id';
}
