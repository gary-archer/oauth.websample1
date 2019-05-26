import * as $ from 'jquery';
import {Authenticator} from '../plumbing/oauth/authenticator';

/*
 * The user info fragment shows within a view to render details of the logged in user
 */
export class UserInfoFragment {

    /*
     * Dependencies
     */
    private readonly _authenticator: Authenticator;

    /*
     * Receive dependencies
     */
    public constructor(authenticator: Authenticator) {
        this._authenticator = authenticator;
    }

    /*
     * Run the view, which will get user info from the authenticator's session storage
     */
    public async execute(): Promise<void> {

        const claims = await this._authenticator.getUserInfo();
        if (claims) {
            $('.logincontainer').removeClass('hide');
            $('.logintext').text(`${claims.givenName} ${claims.familyName}`);
        }
    }
}
