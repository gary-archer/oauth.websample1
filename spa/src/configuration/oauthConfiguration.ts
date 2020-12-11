/*
 * A holder for OAuth settings
 */
export interface OAuthConfiguration {
    authority: string;
    clientId: string;
    appUri: string;
    scope: string;
}
