export default class Logger {
  static logger = document.getElementById("logger");

  static displayMessage(message) {
    this.logger.style.color = "black";
    this.logger.textContent = message;
  }

  static displayError(error) {
    this.logger.style.color = "red";
    this.logger.textContent = error;
  }

  static removeMessage() {
    this.logger.textContent = "";
  }
}