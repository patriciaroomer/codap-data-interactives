import Data from "./Data.js"

export default class CSVParser {
    
    constructor() {
        this.data = new Data();
        this.headers = ["User", "Item", "Rating"];
    }

    async parse(file) {
        return new Promise((resolve, reject) => {
            try {
                Papa.parse(file, {
                    header: true,
                    skipEmptyLines: true,
                    delimiter: ";",
                    
                    complete: (results) => {
                        
                        if (!this.validateHeaders(results)) 
                            return reject(new Error(`Invalid CSV format. Expected headers: ${this.headers.join(";")}`));

                        if (!this.validateRows(results))
                            return reject(new Error(`Missing data in row ${i + 2}`));

                        if (!this.validateRatings(results))
                            return reject(new Error(`Invalid rating in row ${i + 2}. Rating must be between 1 and 5`));

                        if (results.errors.length > 0) {
                            return reject(new Error("CSV parsing failed"));
                        }

                        this.data.attributes = results.meta.fields;   
                        this.data.entries = results.data;
                        resolve(true);
                    },

                    error: (error) => {
                        console.error(error);
                        reject(error);
                    }
                })
            } catch (error) {
                console.error(error);
                return reject(new Error("CSV parsing failed"));
            }
        });
    }

    validateHeaders(results) {
        const headers = results.meta.fields || [];
        return headers.length === this.headers.length && this.headers.every((h, i) => headers[i] === h);
    }

    validateRows(results) {
        for (let i = 0; i < results.data.length; i++) {
            const row = results.data[i];
            if (!row.User || !row.Item || row.Rating === undefined || row.Rating === "") return false;
        }
        return true;
    }

    validateRatings(results) {
        for (let i = 0; i < results.data.length; i++) {
            const row = results.data[i];
            const rating = Number(row.Rating);
            if (Number.isNaN(rating) || rating < 1 || rating > 5) return false;
        }
        return true;
    }
}