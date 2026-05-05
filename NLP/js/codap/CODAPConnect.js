export default class CODAPConnect {
  static phone;
  static currentDataContext = "";

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

  static async removeDataContext(name, attrs) {
    await this.sendRequest({
      action: "delete",
      resource: `dataContext[${name}]`
    });
  }
}