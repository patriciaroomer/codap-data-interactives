import Importer from './Importer.js';

export default class KaggleImporter extends Importer {
  constructor() {
    super();
    this.isDownload = false;
    this.host = "https://www.kaggle.com/";
    this.maxFiles = 20;
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

  async getResource(response) {
    const arrayBuffer = await response.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    // Prevent zip bomb
    const fileCount = (Object.values(zip.files).filter(f => !f.dir).length);
    if (fileCount > this.maxFiles) {
      return;
    }

    let file = Object.keys(zip.files).find(f => {
      const format = f.split(".").pop().toLowerCase();
      this.format = `.${format}`;
      return f.endsWith(".csv") || f.endsWith(".json");
    });

    if (!file) {
      return;
    }

    return await zip.files[file].async("string");
  }
}