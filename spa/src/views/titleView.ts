import {OAuthClient} from '../plumbing/oauth/oauthClient';
import {DomUtils} from './domUtils';
import {UserInfoView} from './userInfoView';

/*
 * The title view
 */
export class TitleView {

    private readonly userInfoView: UserInfoView;

    public constructor() {
        this.userInfoView = new UserInfoView();
    }

    /*
     * Render the title HTML
     */
    public load(): void {

        DomUtils.createDiv('#root', 'title');
        const html =
            `<div class='flex px-2 mt-2 items-center'>
                <div class='w-2/3'>
                    <h2 class='text-3xl font-medium'>OAuth Demo App</h2>
                </div>
                <div class='w-1/3'>
                    <div class='text-right'>
                        <p id='username' class='font-bold'></p>
                    </div>
                </div>
            </div>`;
        DomUtils.html('#title', html);
    }

    /*
     * Load the child user info view when requested
     */
    public async loadUserInfo(oauthClient: OAuthClient): Promise<void> {
        await this.userInfoView.load(oauthClient);
    }

    /*
     * Clear the child user info view when requested
     */
    public clearUserInfo(): void {
        this.userInfoView.clear();
    }
}
