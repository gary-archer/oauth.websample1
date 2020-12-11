/*
 * The API claims class for the first sample
 */
export class ApiClaims {

    // The immutable user id from the access token
    private _userId: string;

    // The client id, which typically represents the calling application
    private _clientId: string;

    // OAuth scopes can represent high level areas of the business
    private _scopes: string[];

    /*
     * Give fields default values
     */
    public constructor() {
        this._userId = '';
        this._clientId = '';
        this._scopes = [];
    }

    /*
     * Accessors
     */
    public get userId(): string {
        return this._userId;
    }

    public get clientId(): string {
        return this._clientId;
    }

    public get scopes(): string[] {
        return this._scopes;
    }

    /*
     * Set token claims after introspection
     */
    public setTokenInfo(userId: string, clientId: string, scopes: string[]) {
        this._userId = userId;
        this._clientId = clientId;
        this._scopes = scopes;
    }
}
