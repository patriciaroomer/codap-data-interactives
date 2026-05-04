export default class TextClassificator {
  constructor(corpus) {
    this.corpus = corpus;
    this.attributes = ["Sentiment", "Emotion", "Topic"].map(name => ({name, type: "nominal"}));
  }

  async classify() {
    const sentiments = [];
    const emotions = [];
    const topics = [];
    const apiRoot = "http://localhost:3000/api/text-classification";

    for (const text of this.corpus) {
      const sentimentResponse = await fetch(`${apiRoot}/sentiment?text=${encodeURIComponent(text)}`);
      const emotionResponse = await fetch(`${apiRoot}/emotion?text=${encodeURIComponent(text)}`);
      const topicResponse = await fetch(`${apiRoot}/topic?text=${encodeURIComponent(text)}`);

      const sentimentLabels = await sentimentResponse.json();
      const emotionLabels = await emotionResponse.json();
      const topicLabels = await topicResponse.json();

      sentiments.push(this.getLabelWithHighestScore(sentimentLabels));
      emotions.push(this.getLabelWithHighestScore(emotionLabels));
      topics.push(this.getLabelWithHighestScore(topicLabels));
    }

    console.log(sentiments);
    console.log(emotions);
    console.log(topics);

    this.entries = sentiments.map((sentiment, i) => ({
      values: [
        sentiment,
        emotions[i],
        topics[i]
      ]
    }));
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