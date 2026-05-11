export default class UIListener {
  constructor() {
    this.inputField = document.getElementById("inputField");
    this.outputField = document.getElementById("outputField");
  }

  async removeHighlights() {
    this.inputField.classList.remove("highlighted");
    this.outputField.classList.remove("highlighted");
  }
}