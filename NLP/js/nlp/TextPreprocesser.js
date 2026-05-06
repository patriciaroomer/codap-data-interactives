export default class TextPreprocesser {

  constructor(prompt) {
    this.text = prompt.text;
    this.language = prompt.language;
  }

  async init() {
    const response = await fetch("http://localhost:3000/nlp_lookup.json");
    const json = await response.json();
    this.lookup = json;
  }

  tokenize(text) {
    return text.split(" ");
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
    let stopwords;
    if (this.language === "en") stopwords = this.lookup.stopwords.en;
    if (this.language === "de") stopwords = this.lookup.stopwords.de;
    if (this.language === "fr") stopwords = this.lookup.stopwords.fr;

    this.text = this.text
      .split(" ")
      .filter(word => !stopwords.includes(word))
      .join(" ");

    return this.text;
  }

  lemmatize() {
    let lemmas;
    if (this.language === "en") lemmas = this.lookup.lemmas.en;
    if (this.language === "de") lemmas = this.lookup.lemmas.de;
    if (this.language === "fr") lemmas = this.lookup.lemmas.fr;

    this.text = this.text
      .split(" ")
      .map(token => lemmas[token] || token)
      .join(" ");

    return this.text;
  }

  stem() {
    let stems;
    if (this.language === "en") stems = this.lookup.stems.en;
    if (this.language === "de") stems = this.lookup.stems.de;
    if (this.language === "fr") stems = this.lookup.stems.fr;

    this.text = this.text
      .split(" ")
      .map(token => stems[token] || token)
      .join(" ");

    return this.text;
  }

}