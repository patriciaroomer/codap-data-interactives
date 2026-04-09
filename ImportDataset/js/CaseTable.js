import CODAPConnect from './CODAPConnect.js';

export default class CaseTable {
  constructor(dataContext, entries) {
    this.dataContext = dataContext;
    this.entries = entries;
    this.resource = `dataContext[${dataContext}].collection[${dataContext}].case`;
  }

  create() {

    this.updateDataContext(() => {
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
    });
  }

  updateDataContext(callback) {
    console.log("Updating dataContext");

    console.log(this.entries);

    CODAPConnect.sendRequest({
      action: "create",
      resource: this.resource,
      values: this.entries
    }, () => { if (callback) callback() });
  }


}