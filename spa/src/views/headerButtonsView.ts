import {DomUtils} from './domUtils';

/*
 * A simple view for the header buttons
 */
export class HeaderButtonsView {

    private readonly _onHome: () => void;
    private readonly _onExpireToken: () => void;
    private readonly _onReloadData: () => void;

    public constructor(
        onHome: ()  => void,
        onReloadData: () => void,
        onExpireToken: () => void) {

        this._onHome = onHome;
        this._onReloadData = onReloadData;
        this._onExpireToken = onExpireToken;
    }

    /*
     * Render the view
     */
    /* eslint-disable max-len */
    public load(): void {

        // Render the buttons
        const html =
            `<div class='row'>
                <div class='col-4 my-2 d-flex'>
                    <button id='btnHome' type='button' class='btn btn-primary btn-block p-1'>Home</button>
                </div>
                <div class='col-4 my-2 d-flex'>
                    <button id='btnReloadData' type='button' disabled class='btn btn-primary btn-block p-1 sessionbutton'>Reload Data</button>
                </div>
                <div class='col-4 my-2 d-flex'>
                    <button id='btnExpireAccessToken' type='button' disabled class='btn btn-primary btn-block p-1 sessionbutton'>Expire Token</button>
                </div>
            </div>`;
        DomUtils.html('#headerbuttons', html);

        // Button clicks are handled by the parent class
        DomUtils.onClick('#btnHome', this._onHome);
        DomUtils.onClick('#btnExpireAccessToken', this._onExpireToken);
        DomUtils.onClick('#btnReloadData', this._onReloadData);
    }

    /*
     * Buttons are disabled before data is loaded
     */
    public disableSessionButtons(): void {
        document.querySelectorAll('.sessionbutton').forEach((b) => b.setAttribute('disabled', 'disabled'));
    }

    /*
     * Buttons are enabled when all data loads successfully
     */
    public enableSessionButtons(): void {
        document.querySelectorAll('.sessionbutton').forEach((b) => b.removeAttribute('disabled'));
    }
}
