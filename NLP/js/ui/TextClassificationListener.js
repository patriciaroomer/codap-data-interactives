import CaseTable from '../codap/CaseTable.js';
import CODAPConnect from '../codap/CODAPConnect.js';
import TextClassificator from '../nlp/TextClassificator.js';
import Logger from './Logger.js';
import UIListener from './UIListener.js';

export default class TextClassificationListener extends UIListener {
  constructor() {
    super();
    this.button = document.getElementById("classificationButton");
    this.addListener();
  }

  addListener() {
    this.button.addEventListener("click", async () => {

      try {
        Logger.displayMessage("Loading...");

        if (this.focused == undefined) this.focused = this.outputField;
        this.focused.classList.add("highlighted");

        const classificator = new TextClassificator(this.focused.value);
        await this.handleSentiment(classificator);
        await this.handleEmotion(classificator);
        await this.handleTopic(classificator);

        Logger.removeMessage();
      } catch (error) {
        Logger.displayError("Something went wrong on our end");
      }

    })
  }

  async handleSentiment(classificator) {
    if (!document.getElementById("sentimentBox").checked) return;
    await classificator.classifySentiment();
    await CODAPConnect.createDataContext("Sentiments", classificator.sentimentAttributes);
    await new CaseTable("Sentiments", classificator.sentimentEntries).create();
  }

  async handleEmotion(classificator) {
    if (!document.getElementById("emotionBox").checked) return;
    await classificator.classifyEmotion();
    await CODAPConnect.createDataContext("Emotions", classificator.emotionAttributes);
    await new CaseTable("Emotions", classificator.emotionEntries).create();
  }

  async handleTopic(classificator) {
    await classificator.classifyTopic();
    await CODAPConnect.createDataContext("Topics", classificator.topicAttributes);
    await new CaseTable("Topics", classificator.topicEntries).create();
  }
}