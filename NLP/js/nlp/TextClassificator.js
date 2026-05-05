import Logger from '../ui/Logger.js';

export default class TextClassificator {
  constructor(text) {
    this.text = text;
    this.apiRoot = "http://localhost:3000/api/text-classification";
  }

  async classifySentiment() {
    const sentimentResponse = await this.fetchWithTimeout(`${this.apiRoot}/sentiment?text=${encodeURIComponent(this.text)}`, {});
    const sentimentLabels = await sentimentResponse.json();
    const sentiments = this.sortLabels(sentimentLabels);
    this.sentimentAttributes = this.getLabelNames(sentiments).map(name => ({ name, type: "nominal" }));
    this.sentimentEntries = { values: this.getLabelScores(sentiments) };
  }

  async classifyEmotion() {
    const emotionResponse = await this.fetchWithTimeout(`${this.apiRoot}/emotion?text=${encodeURIComponent(this.text)}`, {});
    const emotionLabels = await emotionResponse.json();
    const emotions = this.sortLabels(emotionLabels);
    this.emotionAttributes = this.getLabelNames(emotions).map(name => ({ name, type: "nominal" }));
    this.emotionEntries = { values: this.getLabelScores(emotions) };
  }

  async classifyTopic() {
    const topicResponse = await this.fetchWithTimeout(`${this.apiRoot}/topic?text=${encodeURIComponent(this.text)}`, {});
    const topicLabels = await topicResponse.json();
    const topics = this.sortLabels(topicLabels);
    this.topicAttributes = this.getLabelNames(topics).map(name => ({ name, type: "nominal" }));
    this.topicEntries = { values: this.getLabelScores(topics) };
  }

  async fetchWithTimeout(api, options = {}, timeout = 10000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(api, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(id);
      return response;
    } catch (err) {
      if (err.name === "AbortError") {
        Logger.displayError("Text classification model timed out, please try again later");
        throw new Error("Request timed out");
      }
      throw err;
    }
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