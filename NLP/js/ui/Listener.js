import CaseTable from '../codap/CaseTable.js';
import CODAPConnect from '../codap/CODAPConnect.js';
import BagOfWords from '../nlp/BagOfWords.js';
import TextClassificator from '../nlp/TextClassificator.js';
import TextPreprocesser from '../nlp/TextPreprocesser.js';
import Logger from './Logger.js';

export default class Listener {
  constructor() {
    this.inputField = document.getElementById("inputField");
    this.outputField = document.getElementById("outputField");
    this.handleHighlights();
    this.addPreprocessingListener();
    this.addBagOfWordsListener();
    this.addClassificationListener();
    this.addInfoListener();
  }

  addPreprocessingListener() {
    const preprocessingButton = document.getElementById("preprocessingButton");

    preprocessingButton.addEventListener("click", async () => {
      const input = this.inputField.value;
      const preprocessor = new TextPreprocesser(input);

      if (document.getElementById("cleanBox").checked) preprocessor.clean();
      if (document.getElementById("stopwordsBox").checked) preprocessor.removeStopwords();
      if (document.getElementById("lemmaBox").checked) preprocessor.lemmatize();
      if (document.getElementById("stemBox").checked) preprocessor.stem();

      this.outputField.value = preprocessor.text;
      this.outputField.classList.add("highlighted");
      await new Promise(r => setTimeout(r, 2000));
      this.outputField.classList.remove("highlighted");
    });
  }

  addBagOfWordsListener() {
    const bagOfWordsButton = document.getElementById("bagOfWordsButton");

    bagOfWordsButton.addEventListener("click", async () => {
      if (this.focused == undefined) {
        this.focused = this.outputField;
      }

      this.focused.classList.add("highlighted");
      const bagOfWords = new BagOfWords(this.focused.value);

      await CODAPConnect.createDataContext("Bag of Words", bagOfWords.attributes);
      await new CaseTable("Bag of Words", bagOfWords.entries).create();
    });
  }

  addClassificationListener() {
    const classificationButton = document.getElementById("classificationButton");

    classificationButton.addEventListener("click", async () => {
      try {
        Logger.displayMessage("Loading...");

        if (this.focused == undefined) {
          this.focused = this.outputField;
        }

        this.focused.classList.add("highlighted");
        const classificator = new TextClassificator(this.focused.value);

        if (document.getElementById("sentimentBox").checked) {
          await classificator.classifySentiment();
          await CODAPConnect.createDataContext("Sentiments", classificator.sentimentAttributes);
          await new CaseTable("Sentiments", classificator.sentimentEntries).create();
        }

        if (document.getElementById("emotionBox").checked) {
          await classificator.classifyEmotion();
          await CODAPConnect.createDataContext("Emotions", classificator.emotionAttributes);
          await new CaseTable("Emotions", classificator.emotionEntries).create();
        }

        if (document.getElementById("topicBox").checked) {
          await classificator.classifyTopic();
          await CODAPConnect.createDataContext("Topics", classificator.topicAttributes);
          await new CaseTable("Topics", classificator.topicEntries).create();
        }

        Logger.removeMessage();
      } catch (error) {
        Logger.displayError("Something went wrong on our end");
      }
    });

  }

  addInfoListener() {
    const infoIcons = document.getElementsByClassName("info");

    infoIcons.array.forEach(icon => {
      icon.addEventListener("hover", () => {

      })
    });
  }

  handleHighlights() {
    this.inputField.addEventListener("focus", () => {
      this.focused = this.inputField;
      this.removeHighlights();
    });

    this.outputField.addEventListener("focus", () => {
      this.focused = this.outputField;
      this.removeHighlights();
    });
  }

  removeHighlights() {
    this.inputField.classList.remove("highlighted");
    this.outputField.classList.remove("highlighted");
  }
}