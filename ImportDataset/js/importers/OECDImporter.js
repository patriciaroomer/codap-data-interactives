import Controller from '../codap/Controller.js';
import Importer from './Importer.js';

export default class OECDImporter extends Importer {
  constructor() {
    super();
    this.isDownload = false;
    this.format = ".csv";
    this.host = "https://data-explorer.oecd.org";
  }

  isDataset(url) {
    return url.startsWith(this.host);
  }

  getDatasetName() {
    const url = new URL(this.url);
    return url.searchParams.get("df[id]").toString();
  }

  constructApiCall() {
    const url = new URL(this.url);
    const params = url.searchParams;

    const agency = params.get("df[ag]");
    const dataflow = params.get("df[id]");
    const version = params.get("df[vs]");
    const dq = params.get("dq");
    const pd = params.get("pd");

    if (!agency || !dataflow || !version || !dq) {
      Controller.displayError("Invalid URL");
      return;
    }

    let startPeriod, endPeriod;
    if (pd) {
      [startPeriod, endPeriod] = pd.split(",");
    }

    const apiUrl = new URL(
      `https://sdmx.oecd.org/public/rest/data/${agency},${dataflow},${version}/${dq}`
    )

    if (startPeriod) apiUrl.searchParams.set("startPeriod", startPeriod);
    if (endPeriod) apiUrl.searchParams.set("endPeriod", endPeriod);

    apiUrl.searchParams.set("format", "csvfilewithlabels");
    apiUrl.searchParams.set("dimensionAtObservation", "AllDimensions");

    return apiUrl.toString();
  }

  getResource(response) {
    return response.text();
  }
}