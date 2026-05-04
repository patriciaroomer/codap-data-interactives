export default class Controller {
  constructor(importers) {
    this.importers = importers;
    this.urlField = document.getElementById("urlUploader");
    this.urlButton = document.getElementById("urlButton");

    this.urlButton.addEventListener("click", () => {
      this.handleInput();
    })

    this.urlField.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        this.urlButton.click();
      }
    })
  }

  static logs = document.getElementById("logs");

  static displayError(message) {
    Controller.logs.classList.add("error");
    Controller.logs.classList.remove("warning");
    Controller.logs.classList.remove("message");
    Controller.logs.textContent = message;
  }

  static displayWarning(message) {
    Controller.logs.classList.add("warning");
    Controller.logs.classList.remove("error");
    Controller.logs.classList.remove("message");
    Controller.logs.textContent = message;
  }

  static displayMessage(message) {
    Controller.logs.classList.add("message");
    Controller.logs.classList.remove("error");
    Controller.logs.classList.remove("warning");
    Controller.logs.textContent = message;
  }

  static removeMessage() {
    console.log("Clearing logs!");
    Controller.logs.classList.remove("error");
    Controller.logs.classList.remove("warning");
    Controller.logs.textContent = "";
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
      Controller.displayError("Invalid URL");
    } else {
      Controller.removeMessage();
    }
  }
}