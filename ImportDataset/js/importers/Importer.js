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
    if (this.getResource == undefined) {
      throw new Error("getResource(response) must be implemented");
    }

    this.url = "";
    this.formats = [".csv", ".json"];
    this.format = this.formats[0] // Default
    this.attributes = [];
    this.entries = [];
  }

  isValidUrl(url) {
    return url && url.startsWith(this.host) && this.isDataset(url);
  }

  async handleInput() {
    this.url = document.getElementById("urlUploader").value;
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
    let resource = await this.getResource(response);

    if (!resource) {
      console.error("Could not find a dataset file through provided URL!");
      return;
    }
    console.log("Fetch successful!");

    switch (this.format) {
      case ".csv":
        await this.parseCsv(resource);
        callback?.();
        break;
      case ".json":
        await this.parseJson(resource);
        callback?.();
        break;
      default:
        console.error("Could not find any file!");
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

  async parseCsv(resource) {
    return new Promise((resolve, reject) => {
      try {
        Papa.parse(resource, {
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
            resolve();
          },
          error: (err) => reject(err)
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  async parseJson(resource) {
    let data;

    if (this.isDownload) {
      const response = await fetch(resource);
      data = await response.json();
    } else {
      data = typeof resource === "string"
        ? JSON.parse(resource)
        : resource;
    }

    const rows = Array.isArray(data) ? data : [data];
    const attributes = new Set();

    rows.forEach(row => {
      if (row && typeof row === "object") {
        Object.keys(row).forEach(key => attributes.add(key));
      }
    });

    this.attributes = Array.from(attributes).map(name => ({
      name, type: "nominal"
    }));

    this.entries = rows.map(row => ({
      values: row
    }));
  }
}