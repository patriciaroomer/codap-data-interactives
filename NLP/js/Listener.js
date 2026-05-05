import CaseTable from './codap/CaseTable.js';
import CODAPConnect from './codap/CODAPConnect.js';
import BagOfWords from './nlp/BagOfWords.js';
import TextPreprocesser from './nlp/TextPreprocesser.js';

export default class Listener {
  constructor() {
    this.inputField = document.getElementById("inputField");
    this.addPreprocessingListener();
    this.addBagOfWordsListener();
    this.classificationButton = document.getElementById("classificationButton");
  }

  addPreprocessingListener() {
    const preprocessingButton = document.getElementById("preprocessingButton");
    const outputField = document.getElementById("outputField");

    preprocessingButton.addEventListener("click", () => {
      const input = this.inputField.value;
      const preprocessor = new TextPreprocesser(input);

      if (document.getElementById("cleanBox").checked) preprocessor.clean();
      if (document.getElementById("stopwordsBox").checked) preprocessor.removeStopwords();
      if (document.getElementById("lemmaBox").checked) preprocessor.lemmatize();
      if (document.getElementById("stemBox").checked) preprocessor.stem();

      outputField.value = preprocessor.text;
    });
  }

  addBagOfWordsListener() {
    const bagOfWordsButton = document.getElementById("bagOfWordsButton");

    bagOfWordsButton.addEventListener("click", async () => {
      const input = this.inputField.value;
      const bagOfWords = new BagOfWords(input);
      await CODAPConnect.createDataContext("Bag of Words", bagOfWords.attributes);
      await new CaseTable("Bag of Words", bagOfWords.entries).create();
    });
  }
}