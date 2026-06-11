import CaseTable from '../codap/CaseTable.js';
import CODAPConnect from '../codap/CODAPConnect.js';
import PromptListener from './PromptListener.js';
import UIListener from './UIListener.js';

export default class BagOfWordsListener extends UIListener {
  constructor() {
    super();
    this.button = document.getElementById("bagOfWordsButton");
    this.addListener();
  }
  
  async addListener() {
    this.button.addEventListener("click", async () => {
      const promptId = localStorage.getItem("promptId");
      const language = localStorage.getItem("language");

      const response = await fetch(`http://localhost:3000/api/nlp/bagofwords?id=${promptId}&language=${language}`);
      const bagOfWords = await response.json();

      const codapAttributes = ["Word", "Count"].map(name => ({name, type: "nominal"}));
      const codapEntries = bagOfWords.map(([word, count]) => ({ values: { Word: word, Count: count }}));
      
      await CODAPConnect.createDataContext("Bag of Words", codapAttributes);
      await new CaseTable("Bag of Words", codapEntries).create();
    });
  }
}