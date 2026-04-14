import Importer from './Importer.js';

export default class OECDImporter extends Importer {
  constructor() {
    super();
    this.isDownload = false;
    // OECD datasets provide a Data Query in the
    // Developer API category, which starts like this:
    this.host = "https://sdmx.oecd.org/public/rest/data/";
  }

  isDataset(url) {
    // Data Query structure is already unique to datasets
    return true;
  }

  prepareUrl(url) {
    const u = new URL(url);
    u.searchParams.set("format", "csvfilewithlabels");
    u.searchParams.set("dimensionAtObservation", "AllDimensions");
    return u.toString();
  }

  getDatasetName() {
    const url = new URL(this.url);
    const parts = url.pathname.split("/").filter(Boolean);
    const dataIndex = parts.indexOf("data");

    // Get datasetId from:
    // "<this.host>.../<dataAgencyId>,<datasetId>/..."
    return parts[dataIndex + 1].split(",")[0];
  }

  constructApiCall() {
    // Data query already represents the API call
    return this.url;
  }

  getFile(response) {
    return response.text();
  }
}