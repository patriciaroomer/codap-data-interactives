import CODAPConnect from "./CODAPConnect.js";

export default class CaseTable {

	static async create() {
		await CODAPConnect.sendRequest({
      action: "create",
      resource: "component",
      values: {
        type: "caseTable",
        name: "k-means Demo",
        dataContext: CODAPConnect.DATACONTEXT,
        isVisible: true,
        dimensions: {
          width: CODAPConnect.WIDGET_WIDTH,
          height: 675
        },
      }
    });
	}

	static async showIteration(iteration, snapshot) {
    await this.deleteAllCases();

    const cases = [];
    for (let i = 0; i < snapshot.points.length; i++) {
      const point = snapshot.points[i];
      const label = snapshot.labels[i];
      cases.push({
        values: {
          pid: i,
          x: point.x,
          y: point.y,
          cluster: "C" + (label + 1),
          iteration: iteration
        }
      });
    }
    await this.createCases(cases);
  }
	
	static async createCases(cases) {
		await CODAPConnect.sendRequest({
			action: "create",
			resource: `dataContext[${CODAPConnect.DATACONTEXT}].collection[${CODAPConnect.COLLECTION}].case`,
			values: cases
		});
	}

	static async deleteAllCases() {
    await CODAPConnect.sendRequest({
      action: "delete",
      resource: `dataContext[${CODAPConnect.DATACONTEXT}].collection[${CODAPConnect.COLLECTION}].allCases`
    });
  }

}