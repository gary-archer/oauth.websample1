import {ClaimsPrincipal} from '../entities/claimsPrincipal.js';
import {Company} from '../entities/company.js';
import {CompanyTransactions} from '../entities/companyTransactions.js';
import {ClientError} from '../errors/clientError.js';
import {ErrorCodes} from '../errors/errorCodes.js';
import {CompanyRepository} from '../repositories/companyRepository.js';

/*
 * Our service layer class applies logic before returning data
 */
export class CompanyService {

    private readonly _repository: CompanyRepository;
    private readonly _claims: ClaimsPrincipal;

    public constructor(repository: CompanyRepository, claims: ClaimsPrincipal) {
        this._repository = repository;
        this._claims = claims;
    }

    /*
     * Return the list of companies
     */
    public async getCompanyList(): Promise<Company[]> {
        return this._repository.getCompanyList();
    }

    /*
     * Return the transaction details for a company
     */
    public async getCompanyTransactions(id: number): Promise<CompanyTransactions> {

        // Forward to the repository class
        const data = await this._repository.getCompanyTransactions(id);

        // If the data is not found we return an unauthorized response
        if (!data) {
            throw this._unauthorizedError(id);
        }

        return data;
    }

    /*
     * Return a 404 error if a company is requested that is not valid for the user
     */
    private _unauthorizedError(companyId: number): ClientError {
        return new ClientError(
            404,
            ErrorCodes.companyNotFound,
            `Company ${companyId} was not found for this user`);
    }
}
