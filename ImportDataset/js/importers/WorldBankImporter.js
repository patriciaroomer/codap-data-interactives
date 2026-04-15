// Notes:
// - Endpoint returns JSON, must be converted to CSV by Papa Parse
// - Maximum of 1000 records per API call
import Importer from './Importer.js';

export default class WorldBankImporter extends Importer {
  constructor() {
    super();
    this.isDownload = true;
    this.host = "https://data360.worldbank.org/";
  }

  isDataset() {
    return url.includes("indicator");
  }

  getDatasetName() {
    const parts = this.url.split("/");
    const index = parts.indexOf("indicator");
    return parts[index + 1];
  }

  constructApiCall() {
    const apiRoot = "https://data360api.worldbank.org";
    const endpoint = new URL(`${apiRoot}/data360/data?`);

    const indicator = this.datasetName.split("_");
    const databaseId = indicator[0] + indicator[1];

    endpoint.searchParams.append("DATABASE_ID", databaseId);
    endpoint.searchParams.append("INDICATOR", indicator);

    return endpoint.toString();
  }

  getFile(response) {
    const json = response.json();
    const csv = Papa.unparse(json);
    return csv;
  }
}