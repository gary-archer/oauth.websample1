/*
 * Token validation
 */

'use strict';
const winston = require('winston');
let logger = null;

/*
 * A class to visualise text output
 */
class AppLogger {

    /*
     * Initialize and set the logging level
     */
    static initialize(level) {

        winston.addColors({
            info: 'white',
            warn: 'yellow',
            error: 'red' 
          });

        const consoleOptions = {
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple(),
            ),
        };

        logger = winston.createLogger({
            level,
            transports: [
                new (winston.transports.Console)(consoleOptions),
            ],
        });
    }
    
    /*
     * Log info level
     */
    static info() {
        logger.info(AppLogger._getText(arguments));
    }
    
    /*
     * Log warn level
     */
    static warn() {
        logger.warn(AppLogger._getText(arguments));
    }
    
    /*
     * Log error level
     */
    static error() {
        logger.error(AppLogger._getText(arguments));
    }
    
    /*
     * Get the text to output
     */
    static _getText(args) {
        const text = Array.prototype.slice.call(args).join(' : ');
        return text;
    }
}

module.exports = AppLogger;