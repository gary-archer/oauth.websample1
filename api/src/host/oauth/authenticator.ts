import {Request} from 'express';
import {createRemoteJWKSet} from 'jose/jwks/remote';
import {jwtVerify} from 'jose/jwt/verify';
import {URL} from 'url';
import {ClaimsPrincipal} from '../../logic/entities/claimsPrincipal';
import {OAuthConfiguration} from '../configuration/oauthConfiguration';
import {ErrorFactory} from '../errors/errorFactory';
import {HttpProxy} from '../utilities/httpProxy';

/*
 * The entry point for OAuth related operations
 */
export class Authenticator {

    private readonly _configuration: OAuthConfiguration;
    private readonly _httpProxy: HttpProxy;

    public constructor(configuration: OAuthConfiguration, httpProxy: HttpProxy) {
        this._configuration = configuration;
        this._httpProxy = httpProxy;
    }

    /*
     * Perform standard JWT validation
     */
    public async validateToken(request: Request): Promise<ClaimsPrincipal> {

        try {

            // Read the JWT from the HTTP header
            const accessToken = this._readAccessToken(request);
            if (!accessToken) {
                throw ErrorFactory.fromMissingTokenError();
            }

            // Download token signing public keys from the Authorization Server, which are then cached
            const jwksOptions = {
                agent: this._httpProxy.agent,
            };
            const remoteJwkSet = createRemoteJWKSet(new URL(this._configuration.jwksEndpoint), jwksOptions);

            // Perform the JWT validation according to best practices
            const options = {
                algorithms: [this._configuration.algorithm],
                issuer: this._configuration.issuer,
                audience: this._configuration.audience,
            };
            const result = await jwtVerify(accessToken, remoteJwkSet, options);

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
