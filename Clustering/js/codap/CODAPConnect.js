export default class CODAPConnect {
  static CODAP_DATA_CONTEXT = "KMeans";
  static CODAP_COLLECTION = "Points";
  static CODAP_LABELS = { singleCase: "Point", pluralCase: "Points" };
  static CODAP_GRAPH_NAME = "KMeansGraph";
  static CODAP_SLIDER_GLOBAL = "iterSlider";
  static CODAP_SLIDER_TITLE = "Iteration";

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
        name: CODAPConnect.CODAP_DATA_CONTEXT,
        title: CODAPConnect.CODAP_DATA_CONTEXT,
        collections: [{
          name: CODAPConnect.CODAP_COLLECTION,
          title: CODAPConnect.CODAP_COLLECTION,
          labels: CODAPConnect.CODAP_LABELS,
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
      resource: `dataContext[${CODAPConnect.CODAP_DATA_CONTEXT}].collection[${CODAPConnect.CODAP_COLLECTION}].allCases`
    });
  }

  static async createCases(cases) {
    await this.sendRequest({
      action: "create",
      resource: `dataContext[${CODAP_DATA_CONTEXT}].collection[${CODAP_COLLECTION}].case`,
      values: cases
    });
  }

  static async createGraphComponent() {
    await this.sendRequest({
      action: "create",
      resource: "component",
      values: {
        type: "graph",
        name: CODAPConnect.CODAP_GRAPH_NAME,
        dimensions: { width: 360, height: 320 },
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
      values: { name: CODAPConnect.CODAP_SLIDER_GLOBAL, value: startValue }
    });

    await this.sendRequest({
      action: "create",
        resource: "component",
        values: {
          title: CODAPConnect.CODAP_SLIDER_TITLE,
          type: "slider",
          globalValueName: CODAPConnect.CODAP_SLIDER_GLOBAL,
          lowerBound: lower,
          upperBound: upper
        }
    });
  }

  static async showIteration(snapshot, iteration) {
    await this.deleteAllCases();

    const cases = [];
    for (let i = 0; i < snapshot.points.length; i++) {
      const point = snapshot.points[i];
      const label = snapshot.label[i];
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