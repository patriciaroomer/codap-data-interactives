import CaseTable from '../codap/CaseTable.js';
import CODAPConnect from '../codap/CODAPConnect.js';

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
    if (this.getFile == undefined) {
      throw new Error("getFile(response) must be implemented");
    }

    this.url = "";
    this.urlField = document.getElementById("urlUploader");
    this.urlButton = document.getElementById("urlButton");

    this.attributes = [];
    this.entries = [];

    this.addListener();
  }

  addListener() {
    this.urlButton.addEventListener("click", () => {
      this.handleInput();
    });
  }

  isValidUrl(url) {
    return url && url.startsWith(this.host) && this.isDataset(url);
  }

  async handleInput() {
    const url = this.urlField.value;
    if (!this.isValidUrl(url)) {
      console.log("Invalid URL");
      // TODO: Tell user the URL is invalid,
      // but only if none of the URL sorts applied
      return;
    }

    this.url = url;
    this.datasetName = this.getDatasetName();
    this.api = this.constructApiCall();
    const exists = await CODAPConnect.dataContextExists(this.datasetName);

    this.parse(() =>
      CODAPConnect.createDataContext(this.datasetName, this.attributes, () =>
        new CaseTable(this.datasetName, this.entries, exists).create())
    );
  }

  async parse(callback) {
    console.log("Parsing dataset...");
    console.log("Connecting to API...");
    const response = await this.connect();
    console.log("Fetching file...");
    const file = await this.getFile(response);

    if (!file) {
      // TODO: Display this message to user
      console.error("Could not find a dataset file through provided URL!");
      return;
    }
    console.log("Fetch succesful!");

    try {
      Papa.parse(file, {
        download: this.isDownload,
        header: true,
        skipEmptyLines: true,
        complete: (result) => {

          const data = result.data;
          const header = data[0];

          this.attributes = Object.keys(header).map(name => ({
            name, type: "nominal"
          }));

          this.entries = data.map(row => ({
            values: row
          }));

          console.log("Parsing successful!");
          callback?.();
        }
      });
    } catch (e) {
      console.error("Failed parsing dataset file: ", e);
    }
  }

  async connect() {
    const response = await fetch(this.api);
    if (!response.ok) {
      throw new Error("Failed to connect to API and/or fetch dataset");
    }
    console.log("Connection successful!");
    return response;
  }
}