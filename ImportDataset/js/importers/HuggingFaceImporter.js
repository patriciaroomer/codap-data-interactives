import Importer from './Importer.js';

export default class HuggingFaceImporter extends Importer {
  constructor() {
    super();
    this.isDownload = true;
    this.host = "https://huggingface.co/";
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
    return `${this.host}api/datasets/${user}/${this.datasetName}`;
  }

  async getResource(response) {
    const metadata = await response.json();
    const files = metadata.siblings.map(file => file.rfilename);

    if (!files || !files.length) {
      return;
    }

    const file = this.findFile(files);
    if (!file) {
      return;
    }

    const parts = this.url.split("/");
    const index = parts.indexOf("datasets");
    const user = parts[index + 1];
    return `${this.host}datasets/${user}/${this.datasetName}/resolve/main/${file}`;
  }
}