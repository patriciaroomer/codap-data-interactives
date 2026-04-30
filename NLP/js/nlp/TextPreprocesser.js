import { removeStopwords } from "https://cdn.skypack.dev/stopword";
import { stemmer } from 'https://esm.sh/stemmer@2?bundle'
import nlp from 'https://esm.sh/compromise';

export default class TextPreprocesser {
  constructor(corpus) {
    this.corpus = corpus;
  }

  process() {
    const cleaned = this.clean(this.corpus);
    const tokens = this.tokenize(cleaned);
    const withoutStopwords = this.removeStopwords(tokens);
    const lemmas = this.lemmatize(withoutStopwords);
    const stems = this.stem(lemmas);
    return this.reconstruct(stems);
  }

  processIndependently() {
    const cleaned = this.clean(this.corpus);
    const tokens = this.tokenize(cleaned);
    const withoutStopwords = this.reconstruct(this.removeStopwords(tokens));
    const stems = this.reconstruct(this.stem(tokens));
    const lemmas = this.reconstruct(this.lemmatize(tokens));
    return [cleaned, withoutStopwords, stems, lemmas];
  }

  // Returns a list of cleaned sentences
  clean(corpus) {
    const result = [];
    for (let text of corpus) {
      text = text.toLowerCase();
      text = text.replace(/<[^>]*>/g, '');
      text = text.replace(/https?:\/\/\S+|www\.\S+/g, '');
      text = text.replace(/\d+/g, '');
      text = text.replace(/[^\w\s]|_/g, '');
      text = text.replace(/\W+/g, ' ');
      text = text.replace(/\s+/g, ' ').trim();
      result.push(text);
    }
    return result;
  }

  tokenize(corpus) {
    return corpus.map(text => text.match(/\b\w+\b/g) || []);
  }

  removeStopwords(tokens) {
    return tokens.map(t => removeStopwords(t));
  }

  stem(tokens) {
    return tokens.map(sentence => sentence.map(t => stemmer(t)));
  }

  lemmatize(tokens) {
    return tokens.map(sentence =>
      sentence.map(word => {
        const doc = nlp(word);

        const asVerb = doc.verbs().toInfinitive().out('text');
        if (asVerb && asVerb !== word) return asVerb;

        const asNoun = doc.nouns().toSingular().out('text');
        if (asNoun && asNoun !== word) return asNoun;

        return word;
      })
    );
  }

  reconstruct(tokens) {
    const result = [];
    for (const token of tokens) {
      result.push(token.join(" "));
    }
    return result;
  }
}