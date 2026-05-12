import TextPreprocesser from './TextPreprocesser.js';
import Prompt from './Prompt.js';
import PromptListener from '../ui/PromptListener.js';

export default class BagOfWords {
  constructor(text) {
    const txt = this.prepare(text);

    this.words = [];
    for (const word of txt.split(" ")) {
      this.words.push(word);
    }

    this.attributes = ["Word", "Count"].map(name => ({name, type: "nominal"}));
    this.count();
  }

  prepare(text) {
    return new TextPreprocesser(new Prompt(text, PromptListener.currentLanguage)).clean();
  }

  count() {
    const bag = new Map();
    for (const word of this.words) {
      const occurrences = bag.get(word);
      if (occurrences == undefined) {
        bag.set(word, 1);
      } else {
        bag.set(word, bag.get(word) + 1);
      }
    }
    this.entries = [...bag].map(([word, count]) => ({
      values: [word, count]
    }));
  }
}