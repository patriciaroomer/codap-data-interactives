import State from '../ui/State.js';
import Slider from './Slider.js';

export default class CODAPConnect {
  static DATACONTEXT = "KMeansDemo";
  static COLLECTION = "Points";
  static SLIDER = "iterSlider";
  static WIDGET_WIDTH = 360;

  static phone;
  static currentDataContext = "";
  static codapSliderValue = 1;

  static clustering;

  static currentIteration = 1;
  static pendingIteration = null;
  static sliderReadScheduled = false;
  static sliderUpdateScheduled = false;

  static {
    this.phone = new iframePhone.IframePhoneRpcEndpoint(
      this.requestHandler, "data-interactive", window.parent
    );
  }

  static requestHandler(request, callback) {
    console.log(request);
    CODAPConnect.handleSliderChange(request);
    callback({ success: true });
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

  static handleSliderChange(request) {
    if (!Slider.sliderChanged(request)) return;
    Slider.queueSliderRead();
  }
}