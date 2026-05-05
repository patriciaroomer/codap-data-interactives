import { removeStopwords } from "https://cdn.skypack.dev/stopword";
import { stemmer } from 'https://esm.sh/stemmer@2?bundle'
import nlp from 'https://esm.sh/compromise';

export default class TextPreprocesser {
  constructor(text) {
    this.text = text;
  }

  tokenize() {
    return this.text.split(" ");
  }

  clean() {
    this.text = this.text.toLowerCase();
    this.text = this.text.replace(/<[^>]*>/g, '');
    this.text = this.text.replace(/https?:\/\/\S+|www\.\S+/g, '');
    this.text = this.text.replace(/\d+/g, '');
    this.text = this.text.replace(/[^\w\s]|_/g, '');
    this.text = this.text.replace(/\W+/g, ' ');
    this.text = this.text.replace(/\s+/g, ' ').trim();
  }

  removeStopwords() {
    const tokens = this.tokenize();
    const cleanedTokens = removeStopwords(tokens);
    this.reconstruct(cleanedTokens);
  }

  stem() {
    const tokens = this.tokenize();
    const stems = [];

    for (const word of tokens) {
      stems.push(stemmer(word));
    }
    this.reconstruct(stems);
  }

  lemmatize() {
    const tokens = this.tokenize();
    const lemmas = [];

    for (const word of tokens) {
      const doc = nlp(word);

      const asVerb = doc.verbs().toInfinitive().out('text');
      if (asVerb && asVerb !== word) {
        lemmas.push(asVerb);
        continue;
      }

      const asNoun = doc.nouns().toSingular().out('text');
      if (asNoun && asNoun !== word) {
        lemmas.push(asNoun);
        continue;
      }

      lemmas.push(word);
    }
    this.reconstruct(lemmas);
  }

  reconstruct(tokens) {
    this.text = tokens.join(" ");
  }
}