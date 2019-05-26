import {Request} from 'express';
import {OAuthConfiguration} from '../../configuration/oauthConfiguration';
import {ClientError} from '../errors/clientError';
import {ErrorHandler} from '../errors/errorHandler';
import {ApiClaims} from './apiClaims';

/*
 * The entry point for OAuth related operations
 */
export class Authenticator {

    /*
     * Instance fields
     */
    private readonly _oauthConfig: OAuthConfiguration;
    private readonly _issuer: any;

    /*
     * Receive dependencies
     */
    public constructor(oauthConfig: OAuthConfiguration, issuer: any) {

        this._oauthConfig = oauthConfig;
        this._issuer = issuer;
        this._setupCallbacks();
    }

    /*
     * Our form of authentication performs introspection and user info lookup
     */
    public async authenticateAndGetClaims(request: Request): Promise<ApiClaims> {

        // Create the Authorization Server client
        const client = new this._issuer.Client({
            client_id: this._oauthConfig.clientId,
            client_secret: this._oauthConfig.clientSecret,
        });

        try {
            // First read the access token and fail if not found
            const accessToken = this._readAccessToken(request);
            if (!accessToken) {
                throw ClientError.create401('No access token was supplied in the bearer header');
            }

            // Make a client request to do the introspection
            const tokenData = await client.introspect(accessToken);
            if (!tokenData.active) {
                throw ClientError.create401('Access token is expired and failed introspection');
            }

            // Read protocol claims and we will use the immutable user id as the subject claim
            const userId = this._getClaim(tokenData.uid, 'uid');
            const clientId = this._getClaim(tokenData.client_id, 'client_id');
            const scope = this._getClaim(tokenData.scope, 'scope');

            // Create and return a claims object
            const claims = new ApiClaims();
            claims.setTokenInfo(userId, clientId, scope.split(' '));
            return claims;

        } catch (e) {

            // Report introspection exceptions clearly
            throw ErrorHandler.fromIntrospectionError(e, this._issuer.introspection_endpoint);
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
    private _getClaim(claim: string, name: string): any {

        if (!claim) {
            throw ErrorHandler.fromMissingClaim(name);
        }

        return claim;
    }

    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    private _setupCallbacks(): void {
        this.authenticateAndGetClaims = this.authenticateAndGetClaims.bind(this);
    }
}
