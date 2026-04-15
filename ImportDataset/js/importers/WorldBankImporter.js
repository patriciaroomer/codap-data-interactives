import Importer from './Importer.js';

export default class WorldBankImporter extends Importer {
  constructor() {
    super();
    this.isDownload = false;
    this.host = "https://data360.worldbank.org/";
  }

  isDataset(url) {
    return url.includes("indicator");
  }

  getDatasetName() {
    const parts = this.url.split("/");
    const index = parts.indexOf("indicator");
    return parts[index + 1];
  }

  constructApiCall() {
    return `http://localhost:3000/api/worldbank/${this.datasetName}`;
  }

  async getFile(response) {
    const json = await response.json();
    const csv = Papa.unparse(json.value);
    return csv;
  }
}