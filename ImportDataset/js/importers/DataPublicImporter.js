import Importer from './Importer.js';

export default class DataPublicImporter extends Importer {
  constructor() {
    super();
    this.isDownload = true;
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
    return `http://localhost:3000/api/datapubliclu/${this.datasetName}`;
  }

  async getFile(response) {
    const json = await response.json();
    const csv = json.resources.find(
      resource => resource.format === "csv"
    );

    return csv.url;
  }

}