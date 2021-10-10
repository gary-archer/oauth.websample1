/*
 * A holder for OAuth settings
 */
export interface OAuthConfiguration {
    jwksEndpoint: string;
    algorithm: string;
    issuer: string;
    audience: string;
}
