/*
 * A range for random error ids
 */
import {ClientError} from './clientError';
const MIN_ERROR_ID = 10000;
const MAX_ERROR_ID = 99999;

/*
 * An error entity that the API will log
 */
export class ApiError extends Error {

    /*
     * Error properties to log
     */
    private readonly _statusCode: number;
    private readonly _apiName: string;
    private readonly _errorCode: string;
    private readonly _instanceId: number;
    private readonly _utcTime: string;
    private _details: string;
    private _stackFrames: string[];

    /*
     * Errors are categorized by error code
     */
    public constructor(errorCode: string, userMessage: string) {

        super(userMessage);

        // Give fields their default values
        this._statusCode = 500;
        this._apiName = 'BasicApi';
        this._errorCode = errorCode;
        this._instanceId = Math.floor(Math.random() * (MAX_ERROR_ID - MIN_ERROR_ID + 1) + MIN_ERROR_ID),
        this._utcTime = new Date().toISOString(),
        this._details = '';

        // Store stack frame details
        this._stackFrames = [];
        this.addToStackFrames(this.stack);

        // Ensure that instanceof works
        Object.setPrototypeOf(this, new.target.prototype);
    }

    public get details(): string {
        return this._details;
    }

    public set details(details: string) {
        this._details = details;
    }

    /*
     * Add details to the stack data, from ourself or downstream errors
     */
    public addToStackFrames(stack: any) {
        const items = stack.split('\n').map((x: string) => x.trim()) as string[];
        items.forEach((i) => {
            this._stackFrames.push(i);
        });
    }

    /*
     * Return an object ready to log, including the stack trace
     */
    public toLogFormat(): any {

        const serviceError: any = {
            details: this._details,
        };

        // Include the stack trace as an array within the JSON object
        if (this.stack) {
            serviceError.stack = this._stackFrames;
        }

        return {
            statusCode: this._statusCode,
            clientError: this.toClientError().toResponseFormat(),
            serviceError,
        };
    }

    /*
     * Translate to a confidential and supportable error response to return to the API caller
     */
    public toClientError(): ClientError {

        // Return the error code to the client
        const error = new ClientError(this._statusCode, this._errorCode, this.message);

        // Also indicate which part of the system, where in logs and when the error occurred
        error.setExceptionDetails(this._apiName, this._instanceId, this._utcTime);
        return error;
    }
}
