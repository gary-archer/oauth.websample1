import {AxiosError} from 'axios';
import {Request} from 'express';
import {JWTVerifyOptions, jwtVerify} from 'jose';
import {ClaimsPrincipal} from '../../logic/entities/claimsPrincipal.js';
import {OAuthConfiguration} from '../configuration/oauthConfiguration.js';
import {ErrorFactory} from '../errors/errorFactory.js';
import {JwksRetriever} from './jwksRetriever.js';

/*
 * The entry point for OAuth related operations
 */
export class AccessTokenValidator {

    private readonly configuration: OAuthConfiguration;
    private readonly jwksRetriever: JwksRetriever;

    public constructor(configuration: OAuthConfiguration, jwksRetriever: JwksRetriever) {
        this.configuration = configuration;
        this.jwksRetriever = jwksRetriever;
    }

    /*
     * Perform standard JWT validation
     */
    public async execute(request: Request): Promise<ClaimsPrincipal> {

        try {

            // Read the JWT from the HTTP header
            const accessToken = this.readAccessToken(request);
            if (!accessToken) {
                throw ErrorFactory.fromMissingTokenError();
            }

            // Perform the JWT validation according to best practices
            const options = {
                algorithms: [this.configuration.algorithm],
                issuer: this.configuration.issuer,
            } as JWTVerifyOptions;

            if (this.configuration.audience) {
                options.audience = this.configuration.audience;
            }

            const result = await jwtVerify(accessToken, this.jwksRetriever.getRemoteJWKSet(), options);

            // Read claims into a claims principal object
            const userId = this.getClaim(result.payload.sub, 'sub');
            const scope = this.getClaim(result.payload['scope'], 'scope');
            return new ClaimsPrincipal(userId, scope.split(' '));

        } catch (e: any) {

            // JWKS URI failures return a 500
            if (e instanceof AxiosError || e.code === 'ERR_JOSE_GENERIC') {
                throw ErrorFactory.fromJwksDownloadError(e);
            }

            // Otherwise return a 401 error, such as when a JWT with an invalid 'kid' value is supplied
            throw ErrorFactory.fromTokenValidationError(e);
        }
    }

    /*
     * Try to read the token from the authorization header
     */
    private readAccessToken(request: Request): string | null {

        const authorizationHeader = request.header('authorization');
        if (authorizationHeader) {
            const parts = authorizationHeader.split(' ');
            if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
                return parts[1];
            }
        }

        return null;
    }

    /*
     * Sanity checks when receiving claims to avoid failing later with a cryptic error
     */
    private getClaim(claim: any, name: string): string {

        if (!claim) {
            throw ErrorFactory.fromMissingClaim(name);
        }

        return claim;
    }
}
