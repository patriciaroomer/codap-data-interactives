import CODAPConnect from './CODAPConnect.js';
import CaseTable from "./CaseTable.js";

export default class CSVImporter {
  constructor() {
    this.uploader = document.getElementById("fileUploader");
    this.attributes = [];
    this.entries = [];
    this.addListener();
  }

  addListener() {
    document.getElementById("fileButton").addEventListener("click", () => {
      if (this.uploader.files.length === 0) {
        console.log("Please upload a file");
        return;
        // TODO: Display this message to user
      }
      this.file = this.uploader.files[0];
      this.parse(() => {
        this.createDataContext();
      })
    });
  }

  parse(callback) {
    console.log("Received file: " + this.file.name);

    Papa.parse(this.file, {
      header: true,
      skipEmptyLines: true,
      complete: (text) => {
        const data = text.data;
        const header = data[0];

        this.attributes = Object.keys(header).map(name => ({
          name: name,
          type: "nominal"
        }));

        this.entries = data.map(row => ({
          values: row
        }));

        if (callback) callback();
      }
    });

  }

  createDataContext() {
    console.log("Creating dataContext for file: " + this.file.name);

    CODAPConnect.sendRequest({
      action: "create",
      resource: "dataContext",
      values: {
        name: this.file.name,
        label: this.file.name,
        collections: [
          { name: this.file.name, attrs: this.attributes }
        ]
      }
    }, () => {
      const caseTable = new CaseTable(this.file.name, this.entries);
      caseTable.create();
    });
  }
}