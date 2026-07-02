import DataContext from "./DataContext.js";
import CODAPConnect from "./CODAPConnect.js";

export default class CaseTable {

	static async create() {
		await CODAPConnect.sendRequest({
      action: "create",
      resource: "component",
      values: {
        type: "caseTable",
        name: "k-means Demo",
        dataContext: DataContext.DATACONTEXT,
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

    const points = snapshot.points.slice();
    const labels = snapshot.labels.slice();

    const cases = [];
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      const label = labels[i];
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
			resource: `dataContext[${DataContext.DATACONTEXT}].collection[${DataContext.COLLECTION}].case`,
			values: cases
		});
	}

	static async deleteAllCases() {
    await CODAPConnect.sendRequest({
      action: "delete",
      resource: `dataContext[${DataContext.DATACONTEXT}].collection[${DataContext.COLLECTION}].allCases`
    });
  }

}