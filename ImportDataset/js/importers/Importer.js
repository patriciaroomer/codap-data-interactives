import CaseTable from '../codap/CaseTable.js';
import DataContext from '../codap/DataContext.js';
import Controller from '../Controller.js';
import CSVParser from '../parsers/CSVParser.js';
import JSONParser from '../parsers/JSONParser.js';

// This class is constructed like an abstract class
export default class Importer {

  constructor() {
    if (this.constructor == Importer) {
      throw new Error("Importer is abstract and cannot be instantiated.");
    }
    if (this.isDataset == undefined) {
      throw new Error("isDataset(url) must be implemented");
    }
    if (this.getDatasetName == undefined) {
      throw new Error("getDatasetName() must be implemented");
    }
    if (this.constructApiCall == undefined) {
      throw new Error("constructApiCall() must be implemented");
    }
    if (this.getResource == undefined) {
      throw new Error("getResource(response) must be implemented");
    }

    this.url = "";
    this.formats = [".csv"];
    this.format = ".csv"; // Default
    this.attributes = [];
    this.entries = [];
    this.maxEntries = 1000;
  }

  isValidUrl(url) {
    return url && url.startsWith(this.host) && this.isDataset(url);
  }

  async handleInput() {
    if (await DataContext.anyExists()) {
      if (!confirm("Importing a dataset will overwrite the current one. All changes to the dataset will be lost.")) {
        return;
      }
    }

    const url = document.getElementById("urlUploader").value;

    if (!this.sanitizeUrl(url)) {
      Controller.displayError("Please use a HTTPS URL");
      return;
    }

    Controller.displayMessage("Loading...");

    this.format = this.formats[0];
    this.url = url;
    this.datasetName = this.getDatasetName();
    this.api = this.constructApiCall();

    const exists = await DataContext.exists(this.datasetName);

    const parsed = await this.parse();
    if (!parsed) {
      return;
    }

    await DataContext.create(this.datasetName, this.attributes);
    await new CaseTable(this.datasetName, this.entries, exists).create();
    
    if (this.format === ".json") {
      Controller.displayWarning("JSON file might potentially be displayed incorrectly.");
      return;
    }

    Controller.removeMessage();
  }

  sanitizeUrl(input) {
    try {
      const url = new URL(input.trim());
      const allowedProtocols = ["https:"];
      if (!allowedProtocols.includes(url.protocol)) {
        return null;
      }
      return url.toString();
    } catch {
      return null;
    }
  }

  async parse(callback) {
    console.log("Parsing dataset...");
    console.log("Connecting to API...");
    const response = await this.connect();
    if (!response) {
      return;
    }
    console.log("Connection succesful!");

    console.log("Fetching file...");
    let resource = await this.getResource(response);
    if (!resource) {
      Controller.displayError("Please try a dataset with a CSV file");
      return;
    }

    console.log("Fetch successful!");

    const parser = this.findParser();
    if (!parser) {
      return;
    }

    const result = await Promise.race([
      parser.parse(resource, this.isDownload),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Parser timeout")), 7000)
      ),
    ]).catch(err => {
      if (err.message === "Parser timeout") {
        Controller.displayError("Parsing timed out, please try a smaller dataset.");
      }
      return;
    });

    if (!result) return;
    this.attributes = parser.attributes;
    this.entries = parser.entries;
    callback?.();

    return true;
  }

  async connect() {
    try {
      const response = await Importer.fetchWithTimeout(this.api);
      return response;
    } catch {
      Controller.displayError("Fetching dataset took too long");
    }
  }

  findParser() {
    let parser;
    switch (this.format) {
      case ".csv":
        parser = new CSVParser();
        break;
      default:
        Controller.displayError("Please try a dataset with a CSV file");
        return;
    }
    return parser;
  }

  findFile(files) {
    let file;
    let i = 0;

    while (!file && i < this.formats.length) {
      file = files.find(f => f.endsWith(this.formats[i]));
      this.format = this.formats[i];
      i++;
    }
    return file;
  }

  static async fetchWithTimeout(url, ms = 7000) {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, ms);

    return fetch(url, { signal: controller.signal })
      .then(response => {
        if (!response.ok) Controller.displayError("Something went wrong, please try again later.");
        if (response.status === 422) Controller.displayError("Please try a dataset with a CSV file");
        return response;
      })
      .finally(() => clearTimeout(timeout));
  }
}