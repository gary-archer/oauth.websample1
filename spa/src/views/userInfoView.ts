import Handlebars from 'handlebars';
import $ from 'jquery';
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

        // If we could get name info then render it
        if (claims && claims.givenName && claims.familyName) {

            // Use Handlebars to compile the HTML and handle dangerous characters securely
            const htmlTemplate = `{{givenName}} {{familyName}}`;
            const template = Handlebars.compile(htmlTemplate);
            const html = template(claims);

            // Update the UI on the supplied DOM element
            $(`#${rootElement}`).text(html);
        }
    }
}
