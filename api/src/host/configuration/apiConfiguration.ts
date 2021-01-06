/*
 * A holder for application settings
 */
export interface ApiConfiguration {
    trustedOrigins: string[];
    useProxy: boolean;
    proxyUrl: string;
}
