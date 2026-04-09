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
}