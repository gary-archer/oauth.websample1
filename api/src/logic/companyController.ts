import {Company} from '../entities/company';
import {CompanyTransactions} from '../entities/companyTransactions';
import {CompanyRepository} from './companyRepository';

/*
 * Our API controller runs after claims handling has completed
 */
export class CompanyController {

    /*
     * The repository is injected
     */
    private readonly _repository: CompanyRepository;

    /*
     * Receive dependencies
     */
    public constructor(repository: CompanyRepository) {
        this._repository = repository;
    }

    /*
     * Return the list of companies
     */
    public async getCompanyList(): Promise<Company[]> {
        return await this._repository.getCompanyList();
    }

    /*
     * Return the transaction details for a company
     */
    public async getCompanyTransactions(id: number): Promise<CompanyTransactions> {
        return await this._repository.getCompanyTransactions(id);
    }
}
