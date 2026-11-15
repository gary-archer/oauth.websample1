/*
 * The simple claims class for the initial code sample
 */
export class ClaimsPrincipal {

    // The subject claim can be used to authorize access to only owned resources
    private subject: string;

    // OAuth scopes can represent high level privileges
    private scopes: string[];

    public constructor(subject: string, scopes: string[]) {
        this.subject = subject;
        this.scopes = scopes;
    }

    public getSubject(): string {
        return this.subject;
    }

    public getScopes(): string[] {
        return this.scopes;
    }
}
