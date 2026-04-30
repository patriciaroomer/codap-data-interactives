import TextPreprocesser from '../nlp/TextPreprocesser.js';
import CODAPConnect from './CODAPConnect.js';

export default class Parser {
  constructor(corpus, preprocessed, categories) {
    const header = ["Text", "Cleaned", "Without stopwords", "Lemmas", "Stems", "Preprocessed", "Category"];
    this.attributes = header.map(name => ({ name, type: "nominal" }));
    this.entries = [];

    const preprocessor = new TextPreprocesser(corpus);
    const results = preprocessor.processIndependently();

    let i = 0;

    while (i < corpus.length) {
      this.entries.push({ values: [
        corpus[i],
        results[0][i], // Cleaned
        results[1][i], // Without stopwords
        results[2][i], // Stems
        results[3][i], // Lemmas
        preprocessed[i],
        categories[i]]});
      i++;
    }
  }
}