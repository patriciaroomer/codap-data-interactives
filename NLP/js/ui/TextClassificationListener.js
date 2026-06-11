import CaseTable from '../codap/CaseTable.js';
import CODAPConnect from '../codap/CODAPConnect.js';
import Logger from './Logger.js';
import UIListener from './UIListener.js';

export default class TextClassificationListener extends UIListener {
  constructor() {
    super();
    this.button = document.getElementById("classificationButton");
    this.api = "http://localhost:3000/api/nlp/classify";
    this.addListener();
  }

  addListener() {
    this.button.addEventListener("click", async () => {

      try {
        Logger.displayMessage("Loading...");

        await Promise.all([
          this.handleSentiment(),
          this.handleEmotion(),
          this.handleTopic(),
        ]);

        Logger.removeMessage();
      } catch (error) {
        Logger.displayError("The classification model timed out, try again later.");
      }
    })
  }

  async handleSentiment() {
    this.handleClassification("sentimentBox", "sentiment", "Sentiments");
  }

  async handleEmotion() {
    this.handleClassification("emotionBox", "emotion", "Emotions");
  }

  async handleTopic() {
    this.handleClassification("topicBox", "topic", "Topics");
  }
  
  async handleClassification(checkbox, category, title) {
    const applicable = await this.isApplicable(checkbox, title);
    if (!applicable) return;
    
    const response = await fetch(`${this.api}/${category}?id=${localStorage.getItem("promptId")}&language=${localStorage.getItem("language")}`);
    const results = await response.json();
    console.log(results);

    const codapAttributes = this.getLabelNames(results).map(name => ({ name, type: "nominal" }));
    const codapEntries = { values: this.getLabelValues(results) };
    await CODAPConnect.createDataContext(title, codapAttributes);
    await new CaseTable(title, codapEntries).create();
  }

  // --- Helper functions --- //

  async isApplicable(checkbox, title) {
    if (!document.getElementById(checkbox).checked) {
      await CODAPConnect.removeDataContext(title);
      return false;
    }
    return true;
  }

  getLabelNames(labels) {
    const names = [];
    for (const label of labels) {
      names.push(label.label);
    }
    return names;
  }

  getLabelValues(labels) {
    const values = {};
    for (const label of labels) {
      values[label.label] = label.score;
    }
    return values;
  }
}