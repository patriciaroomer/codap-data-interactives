import Controller from '../codap/Controller.js';
import Parser from './Parser.js';

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
        data = await this.fetchWithTimeout(resource, 5000);
      } catch {
        Controller.displayError("Fetching dataset took too long, try again later or use a smaller dataset");
        return;
      }
    } else {
      data = typeof resource === "string"
        ? JSON.parse(resource)
        : resource;
    }
    return data;
  }

  async fetchWithTimeout(url, ms = 5000) {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, ms);

    return fetch(url, { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error("Network error");
        return response.json();
      })
      .finally(() => clearTimeout(timeout));
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