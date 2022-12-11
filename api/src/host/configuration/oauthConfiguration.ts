/*
 * A holder for OAuth settings
 */
export interface OAuthConfiguration {
    algorithm: string;
    jwksEndpoint: string;
    issuer: string;
    audience: string;
}
