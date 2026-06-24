export default class Data {
    constructor() {
        this.attributes = [];
        this.entries = [];
    }

    setAttributes(attributes) {
        this.attributes = attributes;
    }

    setEntries(entries) {
        this.entries = entries.map(e => ({ values: e }));
    }
}