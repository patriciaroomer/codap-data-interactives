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
      return;
    }

    console.log("Fetching file...");
    let resource = await this.getResource(response);

    if (!resource) {
      Controller.displayMessage("No dataset found, please use another URL.");
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
        console.error("Could not find any file!");
    }
  }

  async connect() {
    const response = await fetch(this.api);
    if (!response.ok) {
      console.log("No dataset found, please use another URL.");
      Controller.displayMessage("No dataset found, please use another URL.");
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
      const response = await fetch(resource);

      try {
        data = await response.json();
      } catch {
        Controller.displayMessage("File could not be fetched, please choose another dataset");
        return;
      }
      Controller.removeMessage();

    } else {
      try {
        data = typeof resource === "string"
          ? JSON.parse(resource)
          : resource;
      } catch {
        Controller.displayMessage("No dataset found, please choose another URL");
        return;
      }
    }
    Controller.removeMessage();

    let rows;
    if (this.isGeoJson(data)) {
      rows = data.features.map(f => ({
        ...f.properties,
        geometry_type: f.geometry?.type,
        ...this.extractCoordinates(f.geometry)
      })).slice(0, this.maxEntries);
    } else {
      let rawRows;
      if (Array.isArray(data)) {
        rawRows = data;
      } else {
        const found = this.findDataArray(data);
        rawRows = found ? found.data : [data];
      }
      rows = rawRows.slice(0, this.maxEntries);
    }

    const attributes = new Set();
    const flattenedRows = [];
    rows.forEach(row => {
      if (row !== null && typeof row === "object") {
        const flat = this.flatten(row);
        Object.keys(flat).forEach(key => attributes.add(key));
        flattenedRows.push(flat);
      }
    });
    this.attributes = Array.from(attributes).map(name => ({
      name, type: "nominal"
    }));
    this.entries = flattenedRows.map(row => ({
      values: row
    }));
    return true;
  }

  isGeoJson(data) {
    return data?.type === "FeatureCollection" && Array.isArray(data?.features);
  }

  findDataArray(obj, maxDepth = 3, currentDepth = 0) {
    if (currentDepth > maxDepth || Array.isArray(obj)) return null;

    for (const key in obj) {
      const value = obj[key];
      if (Array.isArray(value) && value.length > 0 && typeof value[0] === "object") {
        return { path: key, data: value }; // Found data array
      }
      if (value !== null && typeof value === "object" && !Array.isArray(value)) {
        const nested = this.findDataArray(value, maxDepth, currentDepth + 1);
        if (nested) return { path: `${key}.${nested.path}`, data: nested.data };
      }
    }
    return null;
  }

  extractCoordinates(geometry) {
    if (!geometry) return {};

    if (geometry.type === "Point") {
      return {
        longitude: geometry.coordinates[0],
        latitude: geometry.coordinates[1]
      };
    }

    // for all other types, compute centroid from the first ring of coordinates
    const coords = this.extractFlatCoords(geometry.coordinates);
    if (coords.length === 0) return {};

    const longitude = coords.reduce((sum, c) => sum + c[0], 0) / coords.length;
    const latitude = coords.reduce((sum, c) => sum + c[1], 0) / coords.length;
    return { longitude, latitude };
  }

  // recursively flatten nested coord arrays down to [lng, lat] pairs
  extractFlatCoords(coords) {
    if (!Array.isArray(coords)) return [];
    if (typeof coords[0] === "number") return [coords]; // it's a single [lng, lat]
    return coords.flatMap(c => this.extractFlatCoords(c));
  }

  flatten(obj, delimiter = '.', maxElements = 1000) {
    const result = {};
    const keys = Object.keys(obj).slice(0, maxElements);
    for (const key of keys) {
      const value = obj[key];
      if (Array.isArray(value)) {
        result[key] = value.slice(0, maxElements);
      } else if (value !== null && typeof value === 'object') {
        const nestedKeys = Object.keys(value).slice(0, maxElements);
        for (const nestedKey of nestedKeys) {
          result[`${key}${delimiter}${nestedKey}`] = value[nestedKey];
        }
      } else {
        result[key] = value;
      }
    }
    return result;
  }
}