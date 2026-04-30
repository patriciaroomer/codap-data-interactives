export default class TextClassificator {
  constructor(corpus) {
    this.corpus = corpus;
  }

  async classify() {
    const categories = [];
    for (const text of this.corpus) {
      const response = await fetch(`http://localhost:3000/api/nlp/classify?text=${encodeURIComponent(text)}`);
      const labels = await response.json();
      categories.push(labels[0].label); // Label with highest score
    }
    return categories;
  }
}