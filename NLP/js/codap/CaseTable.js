import CODAPConnect from './CODAPConnect.js';

export default class CaseTable {
  constructor(dataContext, entries) {
    this.dataContext = dataContext;
    this.entries = entries;
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
      resource: `dataContext[${this.dataContext}].case`
    });
    console.log("clear response:", response);
  }

  async writeEntries() {
    console.log("writing entries count:", this.entries.length);

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
        isVisible: true,
        dimensions: {
          width: 1000,
          height: 300
        }
      }
    });
  }
}