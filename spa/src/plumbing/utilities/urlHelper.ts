/*
 * URL utilities
 */
export class UrlHelper {

    /*
     * Parse the hash fragment into an object
     */
    public static getLocationHashData(): any {

        const params: any = {};

        const idx = location.hash.indexOf('#');
        if (idx !== -1) {

            const hashParams = location.hash.slice(idx + 1).split('&');
            hashParams.map((hash) => {
                const [key, val] = hash.split('=');
                params[key] = decodeURIComponent(val);
            });
        }

        return params;
    }
}
