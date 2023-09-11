/*
 * A list of API error codes
 */
export class ErrorCodes {

    // An API request to an invalid route
    public static readonly requestNotFound = 'request_not_found';

    // An API request did not have a valid access token
    public static readonly invalidToken = 'invalid_token';

    // A generic server error with no error translation
    public static readonly serverError = 'server_error';

    // A problem downloading JWKS keys
    public static readonly jwksDownloadError = 'jwks_download_error';

    // A problem validating a token
    public static readonly tokenValidationError = 'token_validation_error';

    // A problem reading claims from payloads
    public static readonly claimsFailure = 'claims_failure';

    // A company was requested that does not exist or the user is unauthorized to access
    public static readonly companyNotFound = 'company_not_found';

    // A company was requested that was not a number
    public static readonly invalidCompanyId = 'invalid_company_id';

    // A problem reading file data
    public static readonly fileReadError = 'file_read_error';
}
