export default class Parser {

  static maxEntries = 1000;

  constructor() {
    if (this.constructor == Parser) {
      throw new Error("Parser is abstract and cannot be instantiated.");
    }
    if (this.parse == undefined) {
      throw new Error("parse(resource, isDownload) must be implemented.");
    }

    this.attributes = [];
    this.entries = [];
  }
}