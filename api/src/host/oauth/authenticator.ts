import {Request} from 'express';
import {Client, custom, IntrospectionResponse, Issuer} from 'openid-client';
import {ApiClaims} from '../../logic/entities/apiClaims';
import {ClientError} from '../../logic/errors/clientError';
import {OAuthConfiguration} from '../configuration/oauthConfiguration';
import {ErrorHandler} from '../errors/errorHandler';
import {HttpProxy} from '../utilities/httpProxy';

/*
 * The entry point for OAuth related operations
 */
export class Authenticator {

    private readonly _oauthConfig: OAuthConfiguration;
    private readonly _issuer: Issuer<Client>;

    public constructor(oauthConfig: OAuthConfiguration, issuer: Issuer<Client>) {
        this._oauthConfig = oauthConfig;
        this._issuer = issuer;
        this._setupCallbacks();
    }

    /*
     * Out source validation of the access token by using introspection
     */
    public async validateTokenAndGetClaims(request: Request): Promise<ApiClaims> {

        // Create the introspection client
        const client = new this._issuer.Client({
            client_id: this._oauthConfig.clientId,
            client_secret: this._oauthConfig.clientSecret,
        });
        client[custom.http_options] = HttpProxy.getOptions;

        try {

            // First read the access token and fail if not found
            const accessToken = this._readAccessToken(request);
            if (!accessToken) {
                throw ClientError.create401('No access token was supplied in the bearer header');
            }

            // Make a client request to do the introspection
            const tokenData: IntrospectionResponse = await client.introspect(accessToken);
            if (!tokenData.active) {
                throw ClientError.create401('Access token is expired and failed introspection');
            }

            // Read protocol claims and we will use the immutable user id as the subject claim
            const userId = this._getClaim((tokenData as any).uid, 'uid');
            const clientId = this._getClaim(tokenData.client_id, 'client_id');
            const scope = this._getClaim(tokenData.scope, 'scope');

            // Create and return a claims object
            const claims = new ApiClaims();
            claims.setTokenInfo(userId, clientId, scope.split(' '));
            return claims;

        } catch (e) {

            // Report introspection exceptions clearly
            throw ErrorHandler.fromIntrospectionError(e, (this._issuer as any).introspection_endpoint);
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
    private _getClaim(claim: string | undefined, name: string): string {

        if (!claim) {
            throw ErrorHandler.fromMissingClaim(name);
        }

        return claim;
    }

    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    private _setupCallbacks(): void {
        this.validateTokenAndGetClaims = this.validateTokenAndGetClaims.bind(this);
    }
}
