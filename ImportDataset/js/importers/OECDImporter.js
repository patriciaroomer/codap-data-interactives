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
    return url.startsWith(this.host);
  }

  getDatasetName() {
    const url = new URL(this.url);
    const parts = url.pathname.split("/").filter(Boolean);
    const index = parts.indexOf("data");

    // Get datasetId from:
    // "<this.host>.../<dataAgencyId>,<datasetId>/..."
    return parts[index + 1].split(",")[0];
  }

  constructApiCall() {
    // Data query already represents the API call
    const url = new URL(this.url);
    url.searchParams.set("format", "csvfilewithlabels");
    return url.toString();
  }

  getResource(response) {
    return response.text();
  }

  async parseCsv(resource) {
    const result = await super.parseCsv(resource);

    // OECD data is very verbose, so reduce it to these columns:
    const columns = ["UNIT_MEASURE", "TIME_PERIOD", "OBS_VALUE"];

    this.attributes = this.attributes.filter(attr => columns.includes(attr.name));
    this.entries = this.entries.map(entry => ({
      values: Object.fromEntries(
        Object.entries(entry.values).filter(([key]) => columns.includes(key))
      )
    }));

    return result;
  }

}