import UIListener from './UIListener.js';

export default class PromptListener extends UIListener {

  static currentLanguage = "en";

  constructor() {
    super();

    this.englishPrompts = document.getElementById("enPrompts").getElementsByTagName("td");
    this.germanPrompts = document.getElementById("dePrompts").getElementsByTagName("td");
    this.frenchPrompts = document.getElementById("frPrompts").getElementsByTagName("td");

    let i = 0;
    for (const prompt of this.englishPrompts) {
      this.addListener(prompt);
      this.addListener(this.germanPrompts[i]);
      this.addListener(this.frenchPrompts[i]);
    }
  }

  addListener(prompt) {
    prompt.addEventListener("click", () => {
      this.inputField.value = prompt.textContent;
    });
  }
}