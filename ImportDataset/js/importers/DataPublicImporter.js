import Importer from './Importer.js';

export default class DataPublicImporter extends Importer {
  constructor() {
    super();
    this.isDownload = false;
    this.host = "https://data.public.lu/";
  }

  isDataset(url) {
    return url.includes("datasets");
  }

  getDatasetName() {
    const parts = this.url.split("/");
    const index = parts.indexOf("datasets");
    return parts[index + 1];
  }

  constructApiCall() {
    return `http://localhost:3000/api/datapubliclu/${encodeURIComponent(this.datasetName)}/`;
  }

  async getResource(response) {
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("text/csv")) {
      this.format = ".csv";
      return await response.text();
    }

    if (contentType.includes("application/json")) {
      this.format = ".json";
      return await response.text();
    }
  }
}