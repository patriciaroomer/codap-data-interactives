import CaseTable from '../codap/CaseTable.js';
import CODAPConnect from '../codap/CODAPConnect.js';
import BagOfWords from '../nlp/BagOfWords.js';
import UIListener from './UIListener.js';

export default class BagOfWordsListener extends UIListener {
  constructor() {
    super();
    this.button = document.getElementById("bagOfWordsButton");
    this.addListener();
  }

  async addListener() {
    this.button.addEventListener("click", async () => {
      if (this.focused == undefined) this.focused = this.outputField;
      this.focused.classList.add("highlighted");

      const bagOfWords = new BagOfWords(this.focused.value);
      await CODAPConnect.createDataContext("Bag of Words", bagOfWords.attributes);
      await new CaseTable("Bag of Words", bagOfWords.entries).create();
    });
  }
}