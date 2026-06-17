import {ErrorLine} from './errorLine';
import {UIError} from './uiError';

/*
 * A class to manage error formatting
 */
export class ErrorFormatter {

    /*
     * Get errors ready for display
     */
    public static getErrorLines(error: UIError): ErrorLine[] {

        const lines: ErrorLine[] = [];

        // Display technical details that are OK to show to users
        if (error.message.length > 0) {
            lines.push(ErrorFormatter.createUserActionLine('User Message', error.message));
        }

        if (error.getArea().length > 0) {
            lines.push(ErrorFormatter.createValueLine('Area', error.getArea()));
        }

        if (error.getErrorCode().length > 0) {
            lines.push(ErrorFormatter.createValueLine('Error Code', error.getErrorCode()));
        }

        if (error.getStatusCode() > 0) {
            lines.push(ErrorFormatter.createValueLine('Status Code', error.getStatusCode().toString()));
        }

        if (error.getInstanceId() > 0) {
            lines.push(ErrorFormatter.createErrorLine('Id', error.getInstanceId().toString()));
        }

        if (error.getUtcTime().length > 0) {

            const errorTime = Date.parse(error.getUtcTime());
            const displayTime = new Date(errorTime).toLocaleString('en', {
                timeZone: 'utc',
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
            }).replace(/,/g, '');
            lines.push(ErrorFormatter.createValueLine('UTC Time', displayTime));
        }

        if (error.getDetails().length > 0) {
            lines.push(ErrorFormatter.createValueLine('Details', error.getDetails()));
        }

        if (error.getUrl().length > 0) {
            lines.push(ErrorFormatter.createValueLine('URL', error.getUrl()));
        }

        return lines;
    }

    /*
     * Return the stack separately, since it is rendered in smaller text
     */
    public static getErrorStack(error: UIError): ErrorLine | null {

        // In debug builds render the stack trace as a long string
        // We can then look up results at https://sourcemaps.info
        if (IS_DEBUG) {
            if (error.stack) {
                return ErrorFormatter.createValueLine('Stack', error.stack);
            }
        }

        return null;
    }

    /*
     * Create a line that will be styled green
     */
    private static createUserActionLine(label: string, value: string): ErrorLine {

        return {
            label,
            value,
            isUserAction: true,
            isValue: false,
            isError: false,
        };
    }

    /*
     * Create a line that will be styled blue
     */
    private static createValueLine(label: string, value: string): ErrorLine {

        return {
            label,
            value,
            isUserAction: false,
            isValue: true,
            isError: false,
        };
    }

    /*
     * Create a line that will be styled red
     */
    private static createErrorLine(label: string, value: string): ErrorLine {

        return {
            label,
            value,
            isUserAction: false,
            isValue: false,
            isError: true,
        };
    }
}
