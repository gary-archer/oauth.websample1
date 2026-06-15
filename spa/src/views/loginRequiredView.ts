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
            `<div class='text-center'>
                You are signed out - sign in to access the app ...
            </div>`;
        DomUtils.html('#main', html);
    }
}
