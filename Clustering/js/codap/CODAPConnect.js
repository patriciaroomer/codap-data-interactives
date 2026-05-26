export default class CODAPConnect {
  static DATACONTEXT = "KMeansDemo";
  static COLLECTION = "Points";
  static SLIDER = "iterSlider";
  static WIDGET_WIDTH = 360;

  static phone;
  static currentDataContext = "";
  static codapSliderValue = 1;

  static {
    this.phone = new iframePhone.IframePhoneRpcEndpoint(
      this.requestHandler, "data-interactive", window.parent
    );
  }

  static requestHandler(request, callback) {
    callback({ succes: true });
  }

  static sendRequest(request) {
    return new Promise((resolve) => {
      this.phone.call(request, (response) => {
        resolve(response);
      });
    });
  }

  static async createDataContext(name, attrs) {
    await this.removeDataContext(name);

    const response = await this.sendRequest({
      action: "create",
      resource: "dataContext",
      values: {
        name: name,
        label: name,
        collections: [{ name: name, attrs: attrs }]
      }
    });

    if (response?.success) {
      this.currentDataContext = name;
    }
  }

  static async getDataContext(name) {
    await this.sendRequest({
      action: "get",
      resource: `dataContext[${name}]`
    })
  }

  static async removeDataContext(name) {
    await this.sendRequest({
      action: "delete",
      resource: `dataContext[${name}]`
    });
  }

  static async createDefaultDataContext() {
    await this.sendRequest({
      action: "create",
      resource: "dataContext",
      values: {
        name: CODAPConnect.DATACONTEXT,
        title: "k-means Demo",
        collections: [{
          name: CODAPConnect.COLLECTION,
          title: "Points",
          labels: { singleCase: "Point", pluralCase: "Points"},
          attrs : [
            { name: "pid", type: "numeric", precision: 0 },
            { name: "x", type: "numeric", precision: 4 },
            { name: "y", type: "numeric", precision: 4 },
            { name: "cluster", type: "categorical" },
            { name: "iteration", type: "numeric", precisiom: 0 }
          ]
        }]
      }
    });
  }

  static async deleteAllCases() {
    await this.sendRequest({
      action: "delete",
      resource: `dataContext[${CODAPConnect.DATACONTEXT}].collection[${CODAPConnect.COLLECTION}].allCases`
    });
  }

  static async createCases(cases) {
    await this.sendRequest({
      action: "create",
      resource: `dataContext[${CODAPConnect.DATACONTEXT}].collection[${CODAPConnect.COLLECTION}].case`,
      values: cases
    });
  }

  static async createGraphComponent() {
    await this.sendRequest({
      action: "create",
      resource: "component",
      values: {
        type: "graph",
        name: "KMeansGraph",
        dimensions: { 
          width: CODAPConnect.WIDGET_WIDTH, 
          height: 320 
        },
        position: "top",
        xAttributeName: "x",
        yAttributeName: "y",
        legendAttributeName: "cluster",
        enableNumberToggle: false
      }
    });
  }

  static async createSliderComponent(lower, upper, startValue) {
    await this.sendRequest({
      action: "create",
      resource: "global",
      values: { name: CODAPConnect.SLIDER, value: startValue }
    });

    await this.sendRequest({
      action: "create",
      resource: "component",
      values: {
        title: "Iteration",
        type: "slider",
        globalValueName: CODAPConnect.SLIDER,
        lowerBound: lower,
        upperBound: upper,
        dimensions: {
          width: CODAPConnect.WIDGET_WIDTH,
          height: 95
        }
      }
    });
  }

  static async createTable() {
    await this.sendRequest({
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
}