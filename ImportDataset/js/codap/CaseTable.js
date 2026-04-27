import CODAPConnect from './CODAPConnect.js';

export default class CaseTable {
  constructor(dataContext, entries, isUpdate = false) {
    this.dataContext = dataContext;
    this.entries = entries;
    this.isUpdate = isUpdate;
    this.resource = `dataContext[${dataContext}].collection[${dataContext}].case`;
  }

  async create() {
    console.log("Creating caseTable");

    if (this.isUpdate) {
      await this.rewriteEntries();
    } else {
      await this.writeEntries();
    }

    await this.createComponent();
  }

  async writeEntries() {
    console.log("Writing caseTable entries");

    const response = await CODAPConnect.sendRequest({
      action: "create",
      resource: this.resource,
      values: this.entries
    });

    return response?.success === true;
  }

  async rewriteEntries() {
    console.log("Rewriting caseTable entries");

    const response = await CODAPConnect.sendRequest({
      action: "update",
      resource: this.resource,
      values: this.entries
    });

    return response?.success === true;
  }

  async createComponent() {
    console.log("Creating caseTable component");

    const response = await CODAPConnect.sendRequest({
      action: "create",
      resource: "component",
      values: {
        type: "caseTable",
        name: this.dataContext,
        dataContext: this.dataContext,
        collection: this.dataContext,
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