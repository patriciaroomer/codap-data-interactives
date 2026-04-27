import CaseTable from '../codap/CaseTable.js';
import CODAPConnect from '../codap/CODAPConnect.js';
import Controller from '../codap/Controller.js';
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
    this.formats = [".csv", ".json"];
    this.format = this.formats[0] // Default
    this.attributes = [];
    this.entries = [];
    this.maxEntries = 1000;
  }

  isValidUrl(url) {
    return url && url.startsWith(this.host) && this.isDataset(url);
  }

  async handleInput() {
    Controller.removeMessage();

    const url = document.getElementById("urlUploader").value;

    if (!this.sanitizeUrl(url)) {
      Controller.displayError("Invalid URL");
      return;
    }

    this.format = this.formats[0];
    this.url = url;
    this.datasetName = this.getDatasetName();
    this.api = this.constructApiCall();

    const exists = await CODAPConnect.dataContextExists(this.datasetName);

    await this.parse();
    await CODAPConnect.createDataContext(this.datasetName, this.attributes);
    await new CaseTable(this.datasetName, this.entries, exists).create();
    if (this.format === ".json") {
      Controller.displayWarning("JSON file might potentially be displayed incorrectly.");
    }
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

    console.log("Fetching file...");
    let resource = await this.getResource(response);
    if (!resource) {
      Controller.displayError("Could not find supported file format. Please try another URL");
      return;
    }

    console.log("Fetch successful!");

    const parser = this.findParser();
    if (!parser) {
      return;
    }

    const result = await parser.parse(resource, this.isDownload);
    if (!result) return;
    this.attributes = parser.attributes;
    this.entries = parser.entries;
    callback?.();

    return true;
  }

  async connect() {
    const response = await fetch(this.api);
    if (!response.ok) {
      Controller.displayError("Could not find dataset, please try another URL");
      return;
    }
    console.log("Connection successful!");
    return response;
  }

  findParser() {
    let parser;
    switch (this.format) {
      case ".csv":
        parser = new CSVParser();
        break;
      case ".json":
        parser = new JSONParser();
        Controller.displayWarning("JSON file might potentially be displayed incorrectly.");
        break;
      default:
        Controller.displayError("No suitable file found");
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
}