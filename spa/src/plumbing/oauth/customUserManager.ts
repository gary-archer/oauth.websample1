import {randomBytes} from 'crypto';
import * as Oidc from 'oidc-client';

/*
 * An override to allow us to implement OAuth features gradually
 */
export class CustomUserManager extends Oidc.UserManager {

    public constructor(settings: Oidc.UserManagerSettings) {
        super(settings);
    }

    /*
     * Apply a hack so that we can do a login redirect with response_type=token
     */
    public async createSigninRequest(args?: any): Promise<Oidc.SigninRequest> {

        const request = await super.createSigninRequest(args);

        // We are intentionally using the wrong flow in order to explain OAuth features gradually
        // This requires a hack because Okta requires a nonce when response_type is token
        const nonce = this._generateNonce();
        request.url += `&nonce=${nonce}`;
        return request;
    }

    /*
     * Generate a nonce
     */
    private _generateNonce(): string {
        return randomBytes(16)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    }
}
