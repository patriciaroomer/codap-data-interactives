import CaseTable from '../codap/CaseTable.js';
import CODAPConnect from '../codap/CODAPConnect.js';
import Controller from '../codap/Controller.js';

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
    const url = document.getElementById("urlUploader").value;

    if (!this.sanitizeUrl(url)) {
      Controller.displayMessage("Invalid URL");
      return;
    }
    Controller.removeMessage();

    this.url = url;
    this.datasetName = this.getDatasetName();
    this.api = this.constructApiCall();
    const exists = await CODAPConnect.dataContextExists(this.datasetName);

    this.parse(() =>
      CODAPConnect.createDataContext(this.datasetName, this.attributes, () =>
        new CaseTable(this.datasetName, this.entries, exists).create())
    );
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
      return; // Already handled
    }

    console.log("Fetching file...");
    let resource = await this.getResource(response);
    if (!resource) {
      Controller.displayMessage("Could not find supported file format. Please try another URL");
      return;
    }
    Controller.removeMessage();

    console.log("Fetch successful!");

    let result;
    switch (this.format) {
      case ".csv":
        result = await this.parseCsv(resource);
        if (!result) return;
        callback?.();
        break;
      case ".json":
        result = await this.parseJson(resource);
        if (!result) return;
        callback?.();
        break;
      default:
        Controller.displayMessage("No file found");
        return;
    }
  }

  async connect() {
    const response = await fetch(this.api);
    if (!response.ok) {
      Controller.displayMessage("Could not find dataset, please try another URL");
      return;
    }
    Controller.removeMessage();
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

            const data = result.data.slice(0, this.maxEntries);
            const header = data[0];

            this.attributes = Object.keys(header).slice(0, this.maxAttributes).map(name => ({
              name, type: "nominal"
            }));

            this.entries = data.map(row => ({
              values: row
            }));

            console.log("Parsing successful!");
            resolve(true);
          },
          error: (err) => {
            Controller.displayMessage("Could not parse dataset, please choose another one.");
            reject(err)
          }
        });
      } catch {
        reject(false);
      }
    });
  }

  async parseJson(resource) {
    let data;

    if (this.isDownload) {
      try {
        data = await this.fetchWithTimeout(resource, 5000);
      } catch {
        Controller.displayMessage("Fetching timed out");
        return;
      }
    } else {
      data = typeof resource === "string"
        ? JSON.parse(resource)
        : resource;
    }

    if (!Array.isArray(data) || typeof data[0] !== "object") {
      Controller.displayMessage("Dataset must be a flat array of objects.");
      return;
    }
    Controller.removeMessage();

    const attributes = new Set();

    data = data.slice(0, this.maxEntries);
    for (const row of data) {
      if (row && typeof row === "object") {
        for (const [key, value] of Object.entries(row)) {

          if (value && typeof value === "object") {
            Controller.displayMessage("Dataset must be a flat array of objects.");
            return;
          }

          attributes.add(key);
        }
      }
    }

    this.attributes = Array.from(attributes).map(name => ({
       name, type: "nominal" }));

    this.entries = data.map(row => ({
      values: row
    }));

    return true;
  }

  async fetchWithTimeout(url, timeoutMs = 5000) {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    return fetch(url, { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error("Network error");
        return res.json();
      })
      .finally(() => clearTimeout(timeout));
  }
}