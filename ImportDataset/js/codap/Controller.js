export default class Controller {
  constructor(importers) {
    this.importers = importers;
    this.urlField = document.getElementById("urlUploader");
    this.urlButton = document.getElementById("urlButton");
    this.logs = document.getElementById("logs");

    this.urlButton.addEventListener("click", () => {
      this.handleInput();
    })
  }

  handleInput() {
    const url = this.urlField.value;
    let handled = false;

    for (const importer of this.importers) {
      if (importer.isValidUrl(url)) {
        importer.handleInput(url);
        handled = true;
        break;
      }
    }

    if (!handled) {
      this.logs.innerHTML = "Invalid URL";
    } else {
      this.logs.innerHTML = "";
    }
  }
}