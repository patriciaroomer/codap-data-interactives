import CODAPConnect from './CODAPConnect.js';

export default class Parser {
  constructor(corpus, preprocessed, categories) {
    const header = ["Text", "Preprocessed", "Category"];
    this.attributes = header.map(name => ({ name, type: "nominal" }));
    this.entries = [];

    let i = 0;
    while (i < corpus.length) {
      this.entries.push({values: [corpus[i], preprocessed[i], categories[i]]});
      i++;
    }
  }
}