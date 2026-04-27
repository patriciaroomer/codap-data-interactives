export default class CODAPConnect {

  static phone;
  static currentDataContext = "";

  static {
    this.phone = new iframePhone.IframePhoneRpcEndpoint(
      this.requestHandler, "data-interactive", window.parent
    );
  }

  static requestHandler(request, callback) {
    callback({ success: true });
  }

  static sendRequest(request) {
    return new Promise((resolve) => {
      this.phone.call(request, (response) => {
        resolve(response);
      });
    });
  }

  static async dataContextExists(name) {
    const response = await this.sendRequest({
      action: "get",
      resource: `dataContext[${name}]`
    });
    return response?.success === true;
  }

  static async anyDataContextExists() {
    const response = await this.sendRequest({
      action: "get",
      resource: "dataContextList"
    });

    const dataContexts = response?.values || [];

    const nonDefaultContexts = dataContexts.filter(
      d => d.name !== "default"
    );

    return nonDefaultContexts.length > 0;
  }

  static async getDataContextList() {
    const response = await this.sendRequest({
      action: "get",
      resource: "dataContextList"
    });
    console.log(response?.values);
    return response?.values || [];
  }

  static async removeDataContext(name) {
    if (!name || name === "default") return true;

    const response = await this.sendRequest({
      action: "delete",
      resource: `dataContext[${name}]`
    });

    return response?.success === true;
  }

  static async createDataContext(name, attrs, callback) {
    console.log("Removing previous dataContext:", this.currentDataContext);

    await this.removeDataContext(this.currentDataContext);

    console.log("Creating dataContext:", name);

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
      console.log("Created dataContext:", name);
    }

    if (callback) callback();

    return response?.success === true;
  }
}