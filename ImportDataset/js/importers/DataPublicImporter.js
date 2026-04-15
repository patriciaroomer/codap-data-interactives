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
    return `${this.host}/en/api/3/action/package_show?id=${this.datasetName}`;
  }

  getFile(response) {
    const json = response.json();
    const csv = json.result.resources.find(
      resource => resource.format === "CSV"
    );
    return csv.url;
  }

}