import Prompts from './PromptListener.js';
import TextPreprocesser from '../nlp/TextPreprocesser.js';
import UIListener from './UIListener.js';
import Prompt from '../nlp/Prompt.js';
import PromptListener from './PromptListener.js';

export default class TextPreprocessingListener extends UIListener {
  constructor() {
    super();
    this.button = document.getElementById("preprocessingButton");
    this.addListener();
  }

  addListener() {
    this.button.addEventListener("click", async () => {
      const input = this.inputField.value;
      const preprocessor = new TextPreprocesser(new Prompt(input, PromptListener.currentLanguage));
      await preprocessor.init();

      if (document.getElementById("cleanBox").checked) preprocessor.clean();
      if (document.getElementById("stopwordsBox").checked) preprocessor.removeStopwords();
      if (document.getElementById("lemmaBox").checked) preprocessor.lemmatize();
      if (document.getElementById("stemBox").checked) preprocessor.stem();

      this.outputField.value = preprocessor.text;

      await this.highlightOutput();
    });
  }

  async highlightOutput() {
    this.outputField.classList.add("highlighted");
    await new Promise(r => setTimeout(r, 2000));
    this.outputField.classList.remove("highlighted");
  }
}