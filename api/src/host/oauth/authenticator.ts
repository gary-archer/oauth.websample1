import {Request} from 'express';
import {jwtVerify} from 'jose/jwt/verify';
import {SampleClaims} from '../../logic/entities/sampleClaims';
import {OAuthConfiguration} from '../configuration/oauthConfiguration';
import {ErrorFactory} from '../errors/errorFactory';
import {HttpProxy} from '../utilities/httpProxy';
import {JwksRetriever} from './jwksRetriever';

/*
 * The entry point for OAuth related operations
 */
export class Authenticator {

    private readonly _configuration: OAuthConfiguration;
    private readonly _jwksRetriever: JwksRetriever;

    public constructor(configuration: OAuthConfiguration, httpProxy: HttpProxy) {
        this._configuration = configuration;
        this._jwksRetriever = new JwksRetriever(this._configuration, httpProxy);
    }

    /*
     * Perform standard JWT validation
     */
    public async validateToken(request: Request): Promise<SampleClaims> {

        try {

            // Read the JWT from the HTTP header
            const accessToken = this._readAccessToken(request);
            if (!accessToken) {
                throw ErrorFactory.fromMissingTokenError();
            }

            // Perform the library validation
            const options = {
                algorithms: [this._configuration.algorithm],
                issuer: this._configuration.issuer,
                audience: this._configuration.audience,
            };
            const result = await jwtVerify(accessToken, this._jwksRetriever.getKey, options);

            // Read claims into a claims principal
            const userId = this._getClaim(result.payload.sub, 'sub');
            const scope = this._getClaim(result.payload['scope'], 'scope');
            return new SampleClaims(userId, scope.split(' '));

        } catch (e: any) {

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
            if (parts.length === 2 && parts[0] === 'Bearer') {
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
