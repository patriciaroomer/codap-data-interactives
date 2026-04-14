import CODAPConnect from './CODAPConnect.js';

export default class CaseTable {
  constructor(dataContext, entries, isUpdate = false) {
    this.dataContext = dataContext;
    this.entries = entries;
    this.isUpdate = isUpdate;
    this.resource = `dataContext[${dataContext}].collection[${dataContext}].case`;
  }

  create() {
    console.log("Creating caseTable");
    if (this.isUpdate) {
      this.rewriteEntries(() => this.createComponent());
    } else {
      this.writeEntries(() => this.createComponent());
    }
  }

  writeEntries(callback) {
    console.log("Writing caseTable entries");
    CODAPConnect.sendRequest({
      action: "create",
      resource: this.resource,
      values: this.entries
    }, () => { if (callback) callback() });
  }

  rewriteEntries(callback) {
    console.log("Rewriting caseTable entries");
    CODAPConnect.sendRequest({
      action: "update",
      resource: this.resource,
      values: this.entries
    }, () => { if (callback) callback() });
  }

  createComponent() {
    console.log("Creating caseTable");
      CODAPConnect.sendRequest({
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
  }
}