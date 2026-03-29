import {ErrorFactory} from '../../plumbing/errors/errorFactory';
import {UIError} from '../../plumbing/errors/uiError';
import {OAuthClient} from '../../plumbing/oauth/oauthClient';
import {Company} from '../entities/company';
import {CompanyTransactions} from '../entities/companyTransactions';

/*
 * Logic related to making API calls
 */
export class ApiClient {

    private readonly apiBaseUrl: string;
    private readonly oauthClient: OAuthClient;

    public constructor(apiBaseUrl: string, oauthClient: OAuthClient) {

        this.apiBaseUrl = apiBaseUrl;
        if (!this.apiBaseUrl.endsWith('/')) {
            this.apiBaseUrl += '/';
        }

        this.oauthClient = oauthClient;
    }

    /*
     * Get a list of companies
     */
    public async getCompanyList(): Promise<Company[]> {

        return await this.callApi('companies', 'GET') as Company[];
    }

    /*
     * Get a list of transactions for a single company
     */
    public async getCompanyTransactions(id: string): Promise<CompanyTransactions> {

        return await this.callApi(`companies/${id}/transactions`, 'GET') as CompanyTransactions;
    }

    /*
     * A common method to get data from an API and handle 401 retries
     */
    private async callApi(path: string, method: string, dataToSend?: any): Promise<any> {

        // Get the full path
        const url = `${this.apiBaseUrl}${path}`;

        // Get the access token
        const token = await this.oauthClient.getAccessToken();
        if (!token) {

            // Throw an error to inform the UI to move the user to the login required view
            throw ErrorFactory.getFromLoginRequired();
        }

        try {

            // Call the API with the access token
            return await this.callApiWithToken(url, method, dataToSend, token);

        } catch (e: any) {

            // Report errors if this is not a 401
            const error = e as UIError;
            if (error.getStatusCode() !== 401) {
                throw e;
            }

            // Token refresh is not implemented until the second code sample
            await this.oauthClient.clearLoginState();
            throw ErrorFactory.getFromLoginRequired();
        }
    }

    /*
     * Do the work of calling the API
     */
    private async callApiWithToken(
        url: string,
        method: string,
        dataToSend: any,
        accessToken: string): Promise<any> {

        try {

            const headers: HeadersInit = {
                'accept': 'application/json',
                'authorization': `Bearer ${accessToken}`,
            };

            const options: RequestInit = {
                method,
                headers,
            };

            if (dataToSend) {
                headers['content-type'] = 'application/json';
                options.body = JSON.stringify(dataToSend);
            }

            const response = await fetch(url, options);
            if (response.ok) {
                return await response.json();
            }

            throw await ErrorFactory.getFromApiResponseError(response);

        } catch (e: any) {
            throw ErrorFactory.getFromFetchError(e, url, 'web API');
        }
    }
}
