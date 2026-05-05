import CaseTable from './codap/CaseTable.js';
import CODAPConnect from './codap/CODAPConnect.js';
import BagOfWords from './nlp/BagOfWords.js';
import TextClassificator from './nlp/TextClassificator.js';
import TextPreprocesser from './nlp/TextPreprocesser.js';

export default class Listener {
  constructor() {
    this.inputField = document.getElementById("inputField");
    this.outputField = document.getElementById("outputField");
    this.addPreprocessingListener();
    this.addBagOfWordsListener();
    this.addClassificationListener();
  }

  addPreprocessingListener() {
    const preprocessingButton = document.getElementById("preprocessingButton");

    preprocessingButton.addEventListener("click", () => {
      const input = this.inputField.value;
      const preprocessor = new TextPreprocesser(input);

      if (document.getElementById("cleanBox").checked) preprocessor.clean();
      if (document.getElementById("stopwordsBox").checked) preprocessor.removeStopwords();
      if (document.getElementById("lemmaBox").checked) preprocessor.lemmatize();
      if (document.getElementById("stemBox").checked) preprocessor.stem();

      this.outputField.value = preprocessor.text;
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

  addClassificationListener() {
    const classificationButton = document.getElementById("classificationButton");

    classificationButton.addEventListener("click", async () => {
      const preprocessed = this.outputField.value;
      const classificator = new TextClassificator(preprocessed);

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
    });
  }
}