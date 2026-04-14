export default class CODAPConnect {

  static phone;

  static {
    this.phone = new iframePhone.IframePhoneRpcEndpoint(
      this.requestHandler, "data-interactive", window.parent
    );
  }

  static requestHandler(request, callback) {
    callback({ "success": true });
  }

  static sendRequest(request, callback) {
    this.phone.call(request, (response) => {
      if (callback) callback(response, request);
    })
  }

  static dataContextExists(name) {
    return new Promise((resolve) => {
      this.sendRequest({
        action: "get",
        resource: "dataContext[" + name + "]"
      }, (response) => {
        resolve(response?.success === true);
      });
    });
  }

  static createDataContext(name, attrs, callback) {
    console.log("Creating dataContext: " + name);

    return new Promise((resolve) => {
      this.sendRequest({
        action: "create",
        resource: "dataContext",
        values: {
          name: name,
          label: name,
          collections: [{ name: name, attrs: attrs }]
        }
      }, (response) => {
        console.log("Creation successful!");
        resolve(response?.success);
        if (callback) callback();
      });
    });
  }
}