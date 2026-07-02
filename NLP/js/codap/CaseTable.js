import CODAPConnect from './CODAPConnect.js';

export default class CaseTable {
  constructor(dataContext, entries, dimensions = { width: 1000, height: 300 }) {
    this.dataContext = dataContext;
    this.entries = entries;
    this.dimensions = dimensions;
  }

  get resource() {
    return `dataContext[${this.dataContext}].collection[${this.dataContext}].case`;
  }

  async create() {
    await this.clearExistingCases();
    await this.writeEntries();
    await this.createComponent();
  }

  async clearExistingCases() {
    const response = await CODAPConnect.sendRequest({
      action: "delete",
      resource: `dataContext[${this.dataContext}].collection[${this.dataContext}].allCases`
    });
    console.log(response);
  }

  async writeEntries() {
    await CODAPConnect.sendRequest({
      action: "create",
      resource: this.resource,
      values: this.entries
    });
  }

  async createComponent() {
    await CODAPConnect.sendRequest({
      action: "create",
      resource: "component",
      values: {
        type: "caseTable",
        name: this.dataContext,
        isIndexHidden: true,
        position: "right",
        dimensions: this.dimensions
      }
    });
  }
}