
import {createRemoteJWKSet} from 'jose/jwks/remote';
import {GetKeyFunction, KeyLike} from 'jose/types';
import {OAuthConfiguration} from '../configuration/oauthConfiguration';
import {ErrorFactory} from '../errors/errorFactory';
import {HttpProxy} from '../utilities/httpProxy';

/*
 * A wrapper to manage routing JWKS download via a proxy and to handle download errors specially
 */
export class JwksRetriever {

    private readonly _remoteJwkSet: GetKeyFunction<any, any>;

    public constructor(configuration: OAuthConfiguration, httpProxy: HttpProxy) {

        const jwksOptions = {
            agent: httpProxy.agent,
        };

        this._remoteJwkSet = createRemoteJWKSet(new URL(configuration.jwksEndpoint), jwksOptions);
        this._setupCallbacks();
    }

    /*
     * Ensures that JWKS errors are handled separate to invalid token errors
     */
    public async getKey(protectedHeader: any, token: any): Promise<KeyLike> {

        try {
            return await this._remoteJwkSet(protectedHeader, token);
        } catch (e) {
            throw ErrorFactory.fromJwksDownloadError(e);
        }
    }

    /*
     * Set up async callbacks
     */
    private _setupCallbacks(): void {
        this.getKey = this.getKey.bind(this);
    }
}
