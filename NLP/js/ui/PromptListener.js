import CODAPConnect from '../codap/CODAPConnect.js';
import TextPreprocessingListener from './TextPreprocessingListener.js';
import UIListener from './UIListener.js';

export default class PromptListener extends UIListener {

  static currentLanguage = "en";

  constructor() {
    super();

    this.tables = [document.getElementById("enPrompts"), document.getElementById("dePrompts"), document.getElementById("frPrompts")];

    const englishPrompts = this.tables[0].getElementsByTagName("td");
    const germanPrompts = this.tables[1].getElementsByTagName("td");
    const frenchPrompts = this.tables[2].getElementsByTagName("td");

    let i = 0;
    for (const prompt of englishPrompts) {
      this.addPromptListener(prompt);
      this.addPromptListener(germanPrompts[i]);
      this.addPromptListener(frenchPrompts[i]);
      i++;
    }

    this.englishButton = document.getElementById("enButton");
    this.germanButton = document.getElementById("deButton");
    this.frenchButton = document.getElementById("frButton");

    this.topicCheckbox = document.getElementById("topicBox");

    this.addEnglishListener();
    this.addGermanListener();
    this.addFrenchListener();
  }

  addPromptListener(prompt) {
    prompt.addEventListener("click", async () => {
      await CODAPConnect.removeDataContext("Bag of Words");
      await CODAPConnect.removeDataContext("Sentiments");
      await CODAPConnect.removeDataContext("Emotions");
      await CODAPConnect.removeDataContext("Topics");

      this.inputField.value = prompt.textContent;
      localStorage.setItem("promptId", prompt.dataset.id);
      new TextPreprocessingListener().preprocess();
    });
  }

  addEnglishListener() {
    this.englishButton.addEventListener("click", () => {
      PromptListener.currentLanguage = "en";
      document.getElementById("dePrompts").classList.add("hidden");
      document.getElementById("frPrompts").classList.add("hidden");
      document.getElementById("enPrompts").classList.remove("hidden");
      this.topicCheckbox.disabled = false;
    });
  }

  addGermanListener() {
    this.germanButton.addEventListener("click", () => {
      PromptListener.currentLanguage = "de";
      document.getElementById("enPrompts").classList.add("hidden");
      document.getElementById("frPrompts").classList.add("hidden");
      document.getElementById("dePrompts").classList.remove("hidden");
      this.topicCheckbox.disabled = true;
    });
  }

  addFrenchListener() {
    this.frenchButton.addEventListener("click", () => {
      PromptListener.currentLanguage = "fr";
      document.getElementById("enPrompts").classList.add("hidden");
      document.getElementById("dePrompts").classList.add("hidden");
      document.getElementById("frPrompts").classList.remove("hidden");
      this.topicCheckbox.disabled = true;
    });
  }
}