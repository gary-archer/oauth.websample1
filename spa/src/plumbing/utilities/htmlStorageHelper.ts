/*
 * A utility class to keep our HTML storage organised
 */
export class HtmlStorageHelper {

    private static prefix = 'basicspa.';
    private static oidcLogLevelKeyName = 'oidc-log-level';

    public static get oidcLogLevel(): string {
        return sessionStorage.getItem(`${HtmlStorageHelper.prefix}${HtmlStorageHelper.oidcLogLevelKeyName}`) ?? '';
    }

    public static set oidcLogLevel(value: string) {
        sessionStorage.setItem(`${HtmlStorageHelper.prefix}${HtmlStorageHelper.oidcLogLevelKeyName}`, value);
    }
}
