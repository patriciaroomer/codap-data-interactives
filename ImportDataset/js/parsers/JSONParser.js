import Controller from '../codap/Controller.js';
import Parser from './Parser.js';
import Importer from '../importers/Importer.js';

export default class JSONParser extends Parser {

  async parse(resource, isDownload) {
    let data = await this.fetchData(resource, isDownload);
    if (!data) {
      return;
    }

    if (!Array.isArray(data) || typeof data[0] !== "object") {
      Controller.displayError("Sorry, could not parse dataset. Please try another one");
      return;
    }

    const attributes = this.findAttributes(data);
    if (!attributes) {
      return;
    }

    this.attributes = Array.from(attributes).map(name => ({
      name, type: "nominal"
    }));

    this.entries = data.map(row => ({
      values: row
    }));

    return true;
  }

  async fetchData(resource, isDownload) {
    let data;
    if (isDownload) {
      try {
        data = await Importer.fetchWithTimeout(resource);
        data = data.json();
      } catch (error){
        Controller.displayError("Fetching dataset took too long");
        return;
      }
    } else {
      data = typeof resource === "string"
        ? JSON.parse(resource)
        : resource;
    }
    return data;
  }

  findAttributes(data) {
    const attributes = new Set();
    data = data.slice(0, Parser.maxEntries);

    for (const row of data) {
      if (!row || typeof row !== "object") {
        Controller.displayError("Sorry, could not parse dataset. Please try another one.");
        return;
      }
      for (const [key, value] of Object.entries(row)) {
        attributes.add(key);
      }
    }
    return attributes;
  }
}