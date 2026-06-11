import Prompts from './PromptListener.js';
import UIListener from './UIListener.js';
import PromptListener from './PromptListener.js';

export default class TextPreprocessingListener extends UIListener {
  constructor() {
    super();

    this.cleanBox = document.getElementById("cleanBox");
    this.stopwordsBox = document.getElementById("stopwordsBox");
    this.lemmaBox = document.getElementById("lemmaBox");
    this.stemBox = document.getElementById("stemBox");

    this.cleanBox.addEventListener("change", () => this.preprocess());
    this.stopwordsBox.addEventListener("change", () => this.preprocess());
    this.lemmaBox.addEventListener("change", () => this.preprocess());
    this.stemBox.addEventListener("change", () => this.preprocess());
  }

  async preprocess() {
    const promptId = localStorage.getItem("promptId");
    const language = localStorage.getItem("language");
    const tasks = this.determineTasks();

    const response = await fetch(`http://localhost:3000/api/nlp/preprocess?id=${promptId}&language=${language}&tasks=${tasks}`)
    let output = await response.text();
    output = output.replace(/"/g, "");

    this.outputField.value = output;
  }

  determineTasks() {
    const tasks = [];
    if (this.cleanBox.checked) tasks.push("clean");
    if (this.stopwordsBox.checked) tasks.push("stopwords");
    if (this.lemmaBox.checked) tasks.push("lemma");
    if (this.stemBox.checked) tasks.push("stem");
    return tasks;
  }
}