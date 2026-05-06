export default class UIListener {
  constructor() {
    this.inputField = document.getElementById("inputField");
    this.inputField.addEventListener("focus", () => {
      this.focused = this.inputField
      this.removeHighlights();
    });

    this.outputField = document.getElementById("outputField");
    this.outputField.addEventListener("focus", () => {
      this.focused = this.outputField
      this.removeHighlights();
    });
  }

  removeHighlights() {
    this.inputField.classList.remove("highlighted");
    this.outputField.classList.remove("highlighted");
  }
}