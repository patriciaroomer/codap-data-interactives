export default class TextClassificator {
  constructor(corpus) {
    this.corpus = corpus;
  }

  async classify() {
    const categories = [];
    for (const text of this.corpus) {
      const response = await fetch(`http://localhost:3000/api/text-classification/sentiment?text=${encodeURIComponent(text)}`);
      const labels = await response.json();
      console.log(labels);
      categories.push(this.getLabelWithHighestScore(labels));
    }
    return categories;
  }

  getLabelWithHighestScore(labels) {
    let max = 0;
    let result;
    for (const label of labels) {
      if (label.score > max) {
        max = label.score;
        result = label.label;
      }
    }
    return result;
  }
}