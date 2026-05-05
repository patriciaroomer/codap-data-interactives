import TextPreprocesser from './nlp/TextPreprocesser.js';

export default class Listener {
  constructor() {
    this.inputField = document.getElementById("inputField");
    this.addPreprocessingListener();
    this.bagOfWordsButton = document.getElementById("bagOfWordsButton");
    this.classificationButton = document.getElementById("classificationButton");
  }

  addPreprocessingListener() {
    const preprocessingButton = document.getElementById("preprocessingButton");
    const outputField = document.getElementById("outputField");

    preprocessingButton.addEventListener("click", () => {
      const input = inputField.value;
      const preprocessor = new TextPreprocesser(input);

      if (document.getElementById("cleanBox").checked) preprocessor.clean();
      if (document.getElementById("stopwordsBox").checked) preprocessor.removeStopwords();
      if (document.getElementById("lemmaBox").checked) preprocessor.lemmatize();
      if (document.getElementById("stemBox").checked) preprocessor.stem();

      outputField.value = preprocessor.text;
    });
  }

  addBagOfWordsListener() {

  }
}