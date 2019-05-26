import {Company} from '../entities/company';
import {CompanyTransactions} from '../entities/companyTransactions';
import {ClientError} from '../plumbing/errors/clientError';
import {ApiClaims} from '../plumbing/oauth/apiClaims';
import {JsonFileReader} from '../plumbing/utilities/jsonFileReader';

/*
 * A simple API controller for getting data about a company and its investments
 */
export class CompanyRepository {

    /*
     * Our dependencies include claims from the token
     */
     private readonly _claims: ApiClaims;
     private readonly _jsonReader: JsonFileReader;

    /*
     * Receive the file reader
     */
    public constructor(claims: ApiClaims, jsonReader: JsonFileReader) {
        this._claims = claims;
        this._jsonReader = jsonReader;
    }

    /*
     * Return the list of companies from a hard coded data file
     */
    public async getCompanyList(): Promise<Company[]> {

        // Read data from a JSON file into objects
        return await this._jsonReader.readData<Company[]>('data/companyList.json');
    }

    /*
     * Return transactions for a company given its id
     */
    public async getCompanyTransactions(id: number): Promise<CompanyTransactions> {

        // Read companies and find that supplied
        const companyList = await this._jsonReader.readData<Company[]>('data/companyList.json');
        const foundCompany = companyList.find((c) => c.id === id);
        if (foundCompany) {

            // Next read transactions from the database
            const companyTransactions =
                await this._jsonReader.readData<CompanyTransactions[]>('data/companyTransactions.json');

            // Then join the data
            const foundTransactions = companyTransactions.find((ct) => ct.id === id);
            if (foundTransactions) {
                foundTransactions.company = foundCompany;
                return foundTransactions;
            }
        }

        // If the data is not found we return 404
        throw this._unauthorizedError(id);
    }

    /*
     * Return a 404 error if a company is requested that does not exist
     */
    private _unauthorizedError(companyId: number): ClientError {
        return new ClientError(404, 'company_not_found', `Company ${companyId} was not found for this user`);
    }
}
