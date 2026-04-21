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
    this.maxAttributes = 20;
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
      Controller.displayMessage("Could not find supported file format, please try another URL");
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

    // Download or API link
    if (this.isDownload) {
      const response = await fetch(resource);
      try {
        data = await response.json();
      } catch {
        Controller.displayMessage("File could not be fetched, please choose another dataset");
        return;
      }

    // Already a string
    } else {
      try {
        data = typeof resource === "string" ? JSON.parse(resource) : resource;
      } catch {
        Controller.displayMessage("No dataset found, please choose another URL");
        return;
      }
    }

    // Reading successful
    Controller.removeMessage();

    let rows;
    // Unnested dataset
    if (Array.isArray(data)) {
      rows = data;
    // Nested dataset, find it first
    } else {
      const dataArray = this.findDataArray(data);
      if (!dataArray) {
        Controller.displayMessage("JSON format not recognized, please a CSV or try another dataset");
        return;
      }
      rows = dataArray.data;
    }

    rows = rows.slice(0, this.maxEntries);
    rows = this.unwrapNestedArrays(rows);

    const attributes = new Set();
    const flatRows = [];

    // Flatten nested elements within the dataset
    rows.forEach(row => {
      if (row !== null && typeof row === "object") {
        const flatRow = this.flatten(row);
        Object.keys(flatRow).forEach(key => attributes.add(key));
        flatRows.push(flatRow);
      }
    });

    // Parse into attributes and entries, which will be used to create the dataContext
    this.attributes = Array.from(attributes).map(name => ({ name, type: "nominal" }));
    this.entries = flatRows.map(row => ({ values: row }));
    return true;
  }

  // Dataset might be nested
  findDataArray(obj, maxDepth = 3, currentDepth = 0) {
    if (currentDepth > maxDepth || Array.isArray(obj)) return null;
    for (const key in obj) {
      const value = obj[key];
      if (Array.isArray(value) && value.length > 0 && typeof value[0] === "object") {
        return { path: key, data: value };
      }
      if (value !== null && typeof value === "object" && !Array.isArray(value)) {
        const nested = this.findDataArray(value, maxDepth, currentDepth + 1);
        if (nested) return { path: `${key}.${nested.path}`, data: nested.data };
      }
    }
    return null;
  }

  /*
  Sometimes the data consists of parent rows with multiple child rows, each with the same attribute names.

  { "order_id": "A1", "date": "2026-01-01", "items": [
    { "product": "Chair", "qty": 2, "price": 49.99 },
    { "product": "Table", "qty": 1, "price": 199.99 }
  ]}

  Usually the parent row attributes consist of metadata, while the child rows are the real unit of interest.
  We "explode" these rows so that they look like this:

  [
    { "order_id": "A1", "date": "2026-01-01", "product": "Chair", "qty": 2, "price": 49.99 },
    { "order_id": "A1", "date": "2026-01-01", "product": "Table", "qty": 1, "price": 199.99 }
  ]
  */
  unwrapNestedArrays(rows) {
    if (rows.length === 0) return rows;

    const sample = rows[0];
    const key = Object.keys(sample).find(k =>
      Array.isArray(sample[k]) && sample[k].length > 0 && typeof sample[k][0] === "object"
    );
    // No nested array found, rows are fine as-is
    if (!key) return rows;

    // Explode: merge parent scalar fields into each child row
    return rows.flatMap(row => {
      const parentFields = Object.fromEntries(
        Object.entries(row).filter(([k, v]) => !Array.isArray(v) && typeof v !== "object")
      );
      return row[key].map(child => ({ ...parentFields, ...child }));
    });
  }

  /*
  Our unwrapped rows might include nested values, like so:
  { "name": "Alice", "address": { "street": ... , "postcode": ..., "city": ...}}
  We flatten it so that it looks like this:
  { "name": "Alice", "address.street": ..., "address.postcode:" ..., "address.city:" ... }
  */
  flatten(obj, delimiter = '.', maxElements = this.maxEntries) {
    const result = {};
    const keys = Object.keys(obj).slice(0, maxElements);

    for (const key of keys) {
      const value = obj[key];

      if (Array.isArray(value)) {
        // Array of primitive types
        if (value.every(item => typeof item !== "object")) {
          result[key] = value.join(", ");
        // Array of objects
        } else {
          result[key] = value.slice(0, maxElements);
        }
      } else if (value !== null && typeof value === 'object') {
        const nestedKeys = Object.keys(value).slice(0, maxElements);
        for (const nestedKey of nestedKeys) {
          const nestedValue = value[nestedKey];
          const flatKey = `${key}${delimiter}${nestedKey}`;

          // Nested value is an array again
          if (Array.isArray(nestedValue) && nestedValue.every(item => typeof item !== "object")) {
            result[flatKey] = nestedValue.join(", ");

          // Or not
          } else {
            result[flatKey] = nestedValue;
          }
        }
      } else {
        result[key] = value;
      }
    }
    return result;
  }
}