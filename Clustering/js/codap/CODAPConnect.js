import State from '../ui/State.js';
import Slider from './Slider.js';

export default class CODAPConnect {
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
    Slider.handle(request);
    callback({ success: true });
  }

  static sendRequest(request) {
    return new Promise((resolve) => {
      this.phone.call(request, (response) => {
        resolve(response);
      });
    });
  }
}