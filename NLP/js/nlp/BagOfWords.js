export default class BagOfWords {
  constructor(corpus) {
    this.words = [];
    for (const sentence of corpus) {
      for (const word of sentence.split(" ")) {
        this.words.push(word);
      }
    }
    this.attributes = ["Word", "Count"].map(word => ({word, type: "nominal"}));
    this.count();
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