import CODAPConnect from './CODAPConnect.js';
import CaseTable from './CaseTable.js';

export default class HuggingFaceImporter {
  constructor() {
    this.uploader = document.getElementById("urlUploader");
    this.url = "";
    this.attributes = [];
    this.entries = [];
    this.addListener();
  }

  addListener() {
    document.getElementById("urlButton").addEventListener("click", () => {
      this.url = this.uploader.value;
      if (!this.url || !this.isValidUrl()) {
        console.log("Please insert a valid URL");
        return;
        // TODO: Display this message to user and give instructions
      }

      this.parse(() => {
        this.createDataContext();
      });
    });
  }

  isValidUrl() {
    return this.url.includes("huggingface.co/datasets/");
  }

  async parse(callback) {
    console.log("Received URL: " + this.url);

    try {
      this.url = await this.getFile();

      Papa.parse(this.url, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: (text) => {
          const data = text.data;
          const header = data[0];

          this.attributes = Object.keys(header).map(name => ({
            name,
            type: "nominal"
          }));

          this.entries = data.map(row => ({
            values: row
          }));

          console.log(this.entries);
          if (callback) callback();
        }

      });


    } catch (e) {
      console.error("Error parsing Hugging Face dataset url: ", e);
    }

  }

  async getFile() {
    const parts = this.url.split("/");
    const index = parts.indexOf("datasets")
    const user = parts[index + 1];
    const dataset = parts[index + 2];

    const response = await this.connect(user, dataset);

    const metadata = await response.json();
    const files = metadata.siblings.map(file => file.rfilename);
    const csv = this.filterCSV(files);

    return `https://huggingface.co/datasets/${user}/${dataset}/resolve/main/${csv}`;
  }

  async connect(user, dataset) {
    const api = `https://huggingface.co/api/datasets/${user}/${dataset}`;
    const response = await fetch(api);
    if (!response.ok) {
      console.error("Failed to fetch dataset");
      return;
      // TODO: Display message to user? (It might always be our fault)
    }
    return response;
  }

  filterCSV(files) {
    const csv = files.find(file => file.endsWith(".csv"));
    if (!csv) {
      console.log("Could not find CSV file through url: " + this.url);
      return;
      // TODO: Display message to user? (It might always be our fault)
      // TODO: Make other file types an option (e.g JSON)
    }
    return csv;
  }

  createDataContext() {
    console.log("Creating dataContext");
    const parts = this.url.split("/");
    const datasetName = parts[parts.length-1];

    CODAPConnect.sendRequest({
      action: "create",
      resource: "dataContext",
      values: {
        name: datasetName,
        label: datasetName,
        collections: [ { name: datasetName , attrs: this.attributes }]
      }
    }, () => {
      const caseTable = new CaseTable(datasetName, this.entries);
      caseTable.create();
    });
  }
}