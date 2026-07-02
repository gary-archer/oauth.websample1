import {Log} from 'oidc-client-ts';
import {HtmlStorageHelper} from './htmlStorageHelper';

/*
 * A helper class to deal with calculating and storing the log level
 */
export class OidcLogger {

    /*
     * Set the initial log details
     */
    public constructor() {

        Log.setLogger(console);

        let level = this.getUrlLogLevel();
        if (!level) {
            level = this.getStoredLogLevel();
        }

        this.setLogLevel(level);
    }

    /*
     * If the URL has been updated such as to #/?log=debug, then update the oidc-client logging level
     */
    public updateLogLevelIfRequired(): void {

        const newLevel = this.getUrlLogLevel();
        if (newLevel && newLevel !== this.getStoredLogLevel()) {
            this.setLogLevel(newLevel);
            HtmlStorageHelper.oidcLogLevel = newLevel;
        }
    }

    /*
     * Get the log level from a query parameter in the URL's query parameters, such as /companies=2?log=info
     */
    private getUrlLogLevel(): string {

        const params = new URLSearchParams(window.location.search);
        const log = params.get('log');
        if (log) {
            return log.toLowerCase();
        }

        return '';
    }

    /*
     * Get the value from session storage if it exists
     */
    private getStoredLogLevel(): string {
        return HtmlStorageHelper.oidcLogLevel;
    }

    /*
     * Set the log level in the session so that it is inherited on page reloads and by the renewal iframe
     */
    private setLogLevel(level: string): void {

        const data: { [key: string]: number | undefined } = {
            none:  Log.NONE,
            error: Log.ERROR,
            warn:  Log.WARN,
            info:  Log.INFO,
            debug: Log.DEBUG,
        };

        const levelToSet = level || 'none';
        const numericLevel = data[levelToSet];
        if (numericLevel !== undefined) {
            Log.setLevel(numericLevel);
        }
    }
}
