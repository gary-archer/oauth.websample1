import {DomUtils} from './domUtils';

/*
 * A simple view for the header buttons
 */
export class HeaderButtonsView {

    private readonly onHome: () => void;
    private readonly onExpireToken: () => void;
    private readonly onReloadData: () => void;

    public constructor(
        onHome: ()  => void,
        onReloadData: () => void,
        onExpireToken: () => void) {

        this.onHome = onHome;
        this.onReloadData = onReloadData;
        this.onExpireToken = onExpireToken;
    }

    /*
     * Render the view
     */
    /* eslint-disable max-len */
    public load(): void {

        // Render the buttons
        DomUtils.createDiv('#container', 'headerbuttons');
        const html =
            `<div class='flex flex-wrap'>
                <div class='w-1/3 p-1 my-2 flex justify-center'>
                    <button id='btnHome' type='button' class='w-4/5 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg'>Home</button>
                </div>
                <div class='w-1/3 p-1 my-2 flex justify-center'>
                    <button id='btnReloadData' type='button' disabled class='w-4/5 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50'>Reload Data</button>
                </div>
                <div class='w-1/3 p-1 my-2 flex justify-center'>
                    <button id='btnExpireAccessToken' type='button' disabled class='w-4/5 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50'>Expire Token</button>
                </div>
            </div>`;
        DomUtils.html('#headerbuttons', html);

        // Button clicks are handled by the parent class
        DomUtils.onClick('#btnHome', this.onHome);
        DomUtils.onClick('#btnExpireAccessToken', this.onExpireToken);
        DomUtils.onClick('#btnReloadData', this.onReloadData);
    }

    /*
     * Update the home button to display Sign In when not authenticated yet
     */
    public setIsAuthenticated(isAuthenticated: boolean): void {
        DomUtils.text('#btnHome', isAuthenticated ? 'Home' : 'Sign In');
    }

    /*
     * Buttons are disabled before data is loaded
     */
    public disableSessionButtons(): void {
        document.querySelector('#btnReloadData')?.setAttribute('disabled', 'disabled');
        document.querySelector('#btnExpireAccessToken')?.setAttribute('disabled', 'disabled');
    }

    /*
     * Buttons are enabled when all data loads successfully
     */
    public enableSessionButtons(): void {
        document.querySelector('#btnReloadData')?.removeAttribute('disabled');
        document.querySelector('#btnExpireAccessToken')?.removeAttribute('disabled');
    }
}
