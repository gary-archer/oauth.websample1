import * as fs from 'fs-extra';

/*
 * A simple utility to deal with the infrastructure of reading JSON files
 */
export class JsonFileReader {

    /*
     * Do the file reading and return a promise
     */
    public async readData<T>(filePath: string): Promise<T> {

        const buffer = await fs.readFile(filePath);
        return JSON.parse(buffer.toString()) as T;
    }
}
