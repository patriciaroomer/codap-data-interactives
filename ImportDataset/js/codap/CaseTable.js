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
    await CODAPConnect.sendRequest({
      action: "delete",
      resource: `dataContext[${this.dataContext}].case`
    });
  }

  async writeEntries() {
    const response = await CODAPConnect.sendRequest({
      action: "create",
      resource: this.resource,
      values: this.entries
    });

    return response?.success === true;
  }

  async createComponent() {
    const response = await CODAPConnect.sendRequest({
      action: "create",
      resource: "component",
      values: {
        type: "caseTable",
        name: this.dataContext,
        dataContext: this.dataContext,
        isVisible: true,
        dimensions: {
          width: 1000,
          height: 300
        }
      }
    });

    return response?.success === true;
  }
}