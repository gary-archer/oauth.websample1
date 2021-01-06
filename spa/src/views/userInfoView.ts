import $ from 'jquery';
import mustache from 'mustache';
import {Authenticator} from '../plumbing/oauth/authenticator';

/*
 * The user info view shows the logged in user
 */
export class UserInfoView {

    /*
     * Do the initial render
     */
    public constructor() {
        $('#username').text('');
    }

    /*
     * Run the view, which will get user info from the authenticator's session storage
     */
    public async load(rootElement: string, authenticator: Authenticator): Promise<void> {

        const claims = await authenticator.getUserInfo();
        if (claims && claims.givenName && claims.familyName) {

            const html = mustache.render('{{givenName}} {{familyName}}', claims);
            $(`#${rootElement}`).text(html);
        }
    }
}
