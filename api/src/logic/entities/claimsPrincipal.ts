/*
 * The simple claims class for the initial code sample
 */
export class ClaimsPrincipal {

    // The subject claim can be used to authorize access to only owned resources
    private _subject: string;

    // OAuth scopes can represent high level privileges
    private _scopes: string[];

    public constructor(subject: string, scopes: string[]) {
        this._subject = subject;
        this._scopes = scopes;
    }

    public get subject(): string {
        return this._subject;
    }

    public get scopes(): string[] {
        return this._scopes;
    }
}
