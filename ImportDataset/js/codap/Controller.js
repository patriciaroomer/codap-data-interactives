export default class Controller {
  constructor(importers) {
    this.importers = importers;
    this.urlField = document.getElementById("urlUploader");
    this.urlButton = document.getElementById("urlButton");

    this.urlButton.addEventListener("click", () => {
      this.handleInput();
    })
  }

  static logs = document.getElementById("logs");

  static displayMessage(message) {
    Controller.logs.innerHTML = message;
  }

  static removeMessage() {
    Controller.logs.innerHTML = "";
  }

  handleInput() {
    const url = this.urlField.value;
    let isValidUrl = false;

    for (const importer of this.importers) {
      if (importer.isValidUrl(url)) {
        importer.handleInput(url);
        isValidUrl = true;
        break;
      }
    }

    if (!isValidUrl) {
      Controller.displayMessage("Invalid URL");
    } else {
      Controller.removeMessage();
    }
  }
}