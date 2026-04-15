import Importer from './Importer.js';

export default class KaggleImporter extends Importer {
  constructor() {
    super();
    this.isDownload = false;
    this.host = "https://www.kaggle.com/";
  }

  isDataset(url) {
    return url.includes("datasets");
  }

  getDatasetName() {
    const parts = this.url.split("/");
    const index = parts.indexOf("datasets");
    return parts[index + 2];
  }

  constructApiCall() {
    const parts = this.url.split("/");
    const index = parts.indexOf("datasets");
    const user = parts[index + 1];
    return `http://localhost:3000/api/kaggle/${user}/${this.datasetName}`;
  }

  async getFile(response) {
    const buffer = await response.arrayBuffer();
    const zip = await JSZip.loadAsync(buffer);

    const csvFile = Object.values(zip.files).find(file =>
      file.name.endsWith(".csv")
    );

    if (!csvFile) {
      console.log("No CSV file found in Kaggle dataset zip");
      // TODO: Display message to user or convert other file types to csv
    }

    return await csvFile.async("string");
  }
}