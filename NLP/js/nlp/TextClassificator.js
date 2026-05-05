export default class TextClassificator {
  constructor(text) {
    this.text = text;
    this.apiRoot = "http://localhost:3000/api/text-classification";
  }

  async classifySentiment() {
    const sentimentResponse = await fetch(`${this.apiRoot}/sentiment?text=${encodeURIComponent(this.text)}`);
    const sentimentLabels = await sentimentResponse.json();
    const sentiments = this.sortLabels(sentimentLabels);
    this.sentimentAttributes = this.getLabelNames(sentiments).map(name => ({ name, type: "nominal" }));
    this.sentimentEntries = { values: this.getLabelScores(sentiments) };
  }

  async classifyEmotion() {
    const emotionResponse = await fetch(`${this.apiRoot}/emotion?text=${encodeURIComponent(this.text)}`);
    const emotionLabels = await emotionResponse.json();
    const emotions = this.sortLabels(emotionLabels);
    this.emotionAttributes = this.getLabelNames(emotions).map(name => ({ name, type: "nominal" }));
    this.emotionEntries = { values: this.getLabelScores(emotions) };
  }

  async classifyTopic() {
    const topicResponse = await fetch(`${this.apiRoot}/topic?text=${encodeURIComponent(this.text)}`);
    const topicLabels = await topicResponse.json();
    const topics = this.sortLabels(topicLabels);
    this.topicAttributes = this.getLabelNames(topics).map(name => ({ name, type: "nominal" }));
    this.topicEntries = { values: this.getLabelScores(topics) };
  }

  sortLabels(labels) {
    return labels.sort((a, b) => b.score - a.score);
  }

  getLabelNames(labels) {
    const names = [];
    for (const label of labels) {
      names.push(label.label);
    }
    return names;
  }

  getLabelScores(labels) {
    const scores = [];
    for (const label of labels) {
      scores.push(label.score);
    }
    return scores;
  }
}