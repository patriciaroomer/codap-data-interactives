import Parser from './Parser.js';
import Controller from '../codap/Controller.js'

export default class CSVParser extends Parser {

  async parse(resource, isDownload) {
    return new Promise((resolve, reject) => {
      try {
        Papa.parse(resource, {
          download: isDownload,
          header: true,
          skipEmptyLines: true,
          complete: (result) => {

            const data = result.data.slice(0, Parser.maxEntries);
            const header = data[0];

            this.attributes = Object.keys(header).map(name => ({
              name, type: "nominal"
            }));

            this.entries = data.map(row => ({
              values: row
            }));

            console.log("Parsing successful!");
            resolve(true);
          },
          error: (err) => {
            Controller.displayError("Could not parse dataset, please choose another one.");
            reject(err)
          }
        });
      } catch {
        reject(false);
      }
    });
  }
}