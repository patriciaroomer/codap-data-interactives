import Prompts from './PromptListener.js';
import TextPreprocesser from '../nlp/TextPreprocesser.js';
import UIListener from './UIListener.js';
import Prompt from '../nlp/Prompt.js';
import PromptListener from './PromptListener.js';

export default class TextPreprocessingListener extends UIListener {
  constructor() {
    super();

    this.cleanBox = document.getElementById("cleanBox");
    this.stopwordsBox = document.getElementById("stopwordsBox");
    this.lemmaBox = document.getElementById("lemmaBox");
    this.stemBox = document.getElementById("stemBox");

    this.cleanBox.addEventListener("change", () => this.preprocess());
    this.stopwordsBox.addEventListener("change", () => this.preprocess());
    this.lemmaBox.addEventListener("change", () => this.preprocess());
    this.stemBox.addEventListener("change", () => this.preprocess());
  }

  async preprocess() {
    let text = document.getElementById("inputField").value;
    const preprocessor = new TextPreprocesser(new Prompt(text, PromptListener.currentLanguage));
    await preprocessor.init();

    if (this.cleanBox.checked) text = preprocessor.clean();
    if (this.stopwordsBox.checked) text = preprocessor.removeStopwords();
    if (this.lemmaBox.checked) text = preprocessor.lemmatize();
    if (this.stemBox.checked) text = preprocessor.stem();
    this.outputField.value = text;
    await this.highlightOutput();
  }

  async highlightOutput() {
    this.outputField.classList.add("highlighted");
    await new Promise(r => setTimeout(r, 2000));
    this.outputField.classList.remove("highlighted");
  }
}