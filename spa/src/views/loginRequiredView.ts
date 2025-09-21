import {DomUtils} from './domUtils';

/*
 * The view presented when the user must authenticate
 */
export class LoginRequiredView {

    /*
     * Render a signed out message
     */
    public async load(): Promise<void> {

        const html =
            `<div class='row'>
                <div class='col-12 text-center mx-auto'>
                    <h5>You are signed out - sign in to access the app ...</h5>
                </div>
            </div>`;
        DomUtils.html('#main', html);
    }
}
