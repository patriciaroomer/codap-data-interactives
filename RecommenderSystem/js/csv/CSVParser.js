import Data from "../recommender/Data.js"

export default class CSVParser {
    
    constructor() {
        this.data = new Data();
    }

    async parse(file) {
        return new Promise((resolve, reject) => {
            try {
                Papa.parse(file, {
                    header: true,
                    skipEmptyLines: true,
                    
                    complete: (results) => {   
                        this.data.setAttributes(results.meta.fields);   
                        this.data.setEntries(results.data);
                        resolve(true);
                    },

                    error: (error) => {
                        console.error(error);
                        reject(error);
                    }
                })
            } catch (error) {
                console.error(error);
                reject(false);
            }
        });
    }
}