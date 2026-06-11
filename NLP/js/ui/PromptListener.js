import CODAPConnect from '../codap/CODAPConnect.js';
import TextPreprocessingListener from './TextPreprocessingListener.js';
import UIListener from './UIListener.js';

export default class PromptListener extends UIListener {

  constructor() {
    super();

    this.enTable = document.getElementById("enPrompts");
    this.deTable = document.getElementById("dePrompts");
    this.frTable = document.getElementById("frPrompts"); 

    this.enPrompts = this.enTable.getElementsByTagName("td");
    this.dePrompts = this.deTable.getElementsByTagName("td");
    this.frPrompts = this.frTable.getElementsByTagName("td");

    this.enButton = document.getElementById("enButton");
    this.deButton = document.getElementById("deButton");
    this.frButton = document.getElementById("frButton");

    this.addListeners();
    this.applySelectedLanguage();
  }

  addListeners() {
    let i = 0;
    for (const prompt of this.enPrompts) {
      this.addPromptListener(prompt);
      this.addPromptListener(this.dePrompts[i]);
      this.addPromptListener(this.frPrompts[i]);
      i++;
    }

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
    this.enButton.addEventListener("click", () => {
      localStorage.setItem("language", "en");
      this.applySelectedLanguage();
    });
  }

  addGermanListener() {
    this.deButton.addEventListener("click", () => {
      localStorage.setItem("language", "de");
      this.applySelectedLanguage();
    });
  }

  addFrenchListener() {
    this.frButton.addEventListener("click", () => {
      localStorage.setItem("language", "fr");
      this.applySelectedLanguage();
    });
  }

  applySelectedLanguage() {
    let language = localStorage.getItem("language");

    if (!language) {
      localStorage.setItem("language", "en");
      language = "en";
    }
    
    // Topic classification is only available in English as of now
    const topicBox = document.getElementById("topicBox");

    switch (language) {
      case "en":
        this.deTable.classList.add("hidden");
        this.frTable.classList.add("hidden");
        this.enTable.classList.remove("hidden");
        topicBox.disabled = false;
        break;
      case "de":
        this.enTable.classList.add("hidden");
        this.frTable.classList.add("hidden");
        this.deTable.classList.remove("hidden");
        topicBox.disabled = true;
        topicBox.checked = false;
        break;
      case "fr":
        this.enTable.classList.add("hidden");
        this.deTable.classList.add("hidden");
        this.frTable.classList.remove("hidden");
        topicBox.disabled = true;
        topicBox.checked = false;
        break;
      default:
        return;
    }
  }
}