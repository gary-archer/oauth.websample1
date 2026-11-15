/*
 * A holder for OAuth settings
 */
export interface OAuthConfiguration {
    jwksEndpoint: string;
    issuer: string;
    audience: string;
    algorithm: string;
}
