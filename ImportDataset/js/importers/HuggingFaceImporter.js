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

  prepareUrl(url) {
    return url;
  }

  getDatasetName() {
    // Last part of URL
    const parts = this.splitUrl("/");
    return parts[parts.length - 1];
  }

  constructApiCall() {
    const parts = this.splitUrl("/");
    const index = parts.indexOf("datasets");
    const user = parts[index + 1];
    return `${this.host}api/datasets/${user}/${this.datasetName}`;
  }

  async getFile(response) {
    const metadata = await response.json();
    const files = metadata.siblings.map(file => file.rfilename);
    const csv = files.find(file => file.endsWith(".csv"));

    // TODO: Make other file types an option
    const parts = this.splitUrl("/");
    const index = parts.indexOf("datasets");
    const user = parts[index + 1];
    return `${this.host}datasets/${user}/${this.datasetName}/resolve/main/${csv}`;
  }


}