import axios, {Method} from 'axios';
import {ErrorHandler} from '../../plumbing/errors/errorHandler';
import {UIError} from '../../plumbing/errors/uiError';
import {Authenticator} from '../../plumbing/oauth/authenticator';
import {AxiosUtils} from '../../plumbing/utilities/axiosUtils';
import {Company} from '../entities/company';
import {CompanyTransactions} from '../entities/companyTransactions';

/*
 * Logic related to making API calls
 */
export class ApiClient {

    private readonly apiBaseUrl: string;
    private readonly authenticator: Authenticator;

    public constructor(apiBaseUrl: string, authenticator: Authenticator) {

        this.apiBaseUrl = apiBaseUrl;
        if (!this.apiBaseUrl.endsWith('/')) {
            this.apiBaseUrl += '/';
        }

        this.authenticator = authenticator;
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
    private async callApi(path: string, method: Method, dataToSend?: any): Promise<any> {

        // Get the full path
        const url = `${this.apiBaseUrl}${path}`;

        // Get the access token
        const token = await this.authenticator.getAccessToken();
        if (!token) {

            // Trigger a login redirect if there is no access token yet
            await this.authenticator.startLogin(null);

            // This completes the API request with an error that the UI does not render
            throw ErrorHandler.getFromLoginRequired();
        }

        try {

            // Call the API with the access token
            return await this.callApiWithToken(url, method, dataToSend, token);

        } catch (e: any) {

            // Report Ajax errors if this is not a 401
            const error = e as UIError;
            if (error.getStatusCode() !== 401)
                throw e;

            // When the access token expires, trigger a login redirect
            // Token refresh is not implemented until the second code sample
            await this.authenticator.startLogin(error);
            throw ErrorHandler.getFromLoginRequired();
        }
    }

    /*
     * Do the work of calling the API
     */
    private async callApiWithToken(
        url: string,
        method: Method,
        dataToSend: any,
        accessToken: string): Promise<any> {

        try {

            const response = await axios.request({
                url,
                method,
                data: dataToSend,
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            AxiosUtils.checkJson(response.data);
            return response.data;

        } catch (e: any) {
            throw ErrorHandler.getFromHttpError(e, url, 'web API');
        }
    }
}
