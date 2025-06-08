import mustache from 'mustache';
import {OAuthClient} from '../plumbing/oauth/oauthClient';
import {DomUtils} from './domUtils';

/*
 * The user info view shows the logged in user
 */
export class UserInfoView {

    /*
     * Run the view, which will get user info from session storage
     */
    public async load(oauthClient: OAuthClient): Promise<void> {

        const claims = await oauthClient.getUserInfo();
        if (claims && claims.givenName && claims.familyName) {

            // Set claims if found
            const text = mustache.render('{{givenName}} {{familyName}}', claims);
            DomUtils.text('#username', text);

        } else {

            // Blank out otherwise
            DomUtils.text('#username', '');
        }
    }
}
