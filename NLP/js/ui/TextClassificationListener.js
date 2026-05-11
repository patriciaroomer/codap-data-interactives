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

        const classificator = new TextClassificator(this.outputField.value);

        await Promise.all([
          this.handleSentiment(classificator),
          this.handleEmotion(classificator),
          this.handleTopic(classificator),
        ]);

        Logger.removeMessage();
      } catch (error) {
        Logger.displayError("The classification model timed out, try again later.");
      }

    })
  }

  async handleSentiment(classificator) {
    if (!document.getElementById("sentimentBox").checked) {
      await CODAPConnect.removeDataContext("Sentiments");
      return;
    }
    await classificator.classifySentiment();
    await CODAPConnect.createDataContext("Sentiments", classificator.sentimentAttributes);
    await new CaseTable("Sentiments", classificator.sentimentEntries).create();
  }

  async handleEmotion(classificator) {
    if (!document.getElementById("emotionBox").checked) {
      await CODAPConnect.removeDataContext("Emotions");
      return
    };
    await classificator.classifyEmotion();
    await CODAPConnect.createDataContext("Emotions", classificator.emotionAttributes);
    await new CaseTable("Emotions", classificator.emotionEntries).create();
  }

  async handleTopic(classificator) {
    if (!document.getElementById("topicBox").checked || document.getElementById("topicBox").disabled) {
      await CODAPConnect.removeDataContext("Topics");
      return;
    }
    await classificator.classifyTopic();
    await CODAPConnect.createDataContext("Topics", classificator.topicAttributes);
    await new CaseTable("Topics", classificator.topicEntries).create();
  }
}