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

    private readonly _configuration: OAuthConfiguration;
    private readonly _jwksRetriever: JwksRetriever;

    public constructor(configuration: OAuthConfiguration, jwksRetriever: JwksRetriever) {
        this._configuration = configuration;
        this._jwksRetriever = jwksRetriever;
    }

    /*
     * Perform standard JWT validation
     */
    public async execute(request: Request): Promise<ClaimsPrincipal> {

        try {

            // Read the JWT from the HTTP header
            const accessToken = this._readAccessToken(request);
            if (!accessToken) {
                throw ErrorFactory.fromMissingTokenError();
            }

            // Perform the JWT validation according to best practices
            const options = {
                algorithms: [this._configuration.algorithm],
                issuer: this._configuration.issuer,
            } as JWTVerifyOptions;

            if (this._configuration.audience) {
                options.audience = this._configuration.audience;
            }

            const result = await jwtVerify(accessToken, this._jwksRetriever.remoteJWKSet, options);

            // Read claims into a claims principal object
            const userId = this._getClaim(result.payload.sub, 'sub');
            const scope = this._getClaim(result.payload['scope'], 'scope');
            return new ClaimsPrincipal(userId, scope.split(' '));

        } catch (e: any) {

            // Generic errors are returned when the JWKS download fails
            if (e.code === 'ERR_JOSE_GENERIC') {
                throw ErrorFactory.fromJwksDownloadError(e);
            }

            // Otherwise return a 401 error, such as when a JWT with an invalid 'kid' value is supplied
            throw ErrorFactory.fromTokenValidationError(e);
        }
    }

    /*
     * Try to read the token from the authorization header
     */
    private _readAccessToken(request: Request): string | null {

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
    private _getClaim(claim: any, name: string): string {

        if (!claim) {
            throw ErrorFactory.fromMissingClaim(name);
        }

        return claim;
    }
}
