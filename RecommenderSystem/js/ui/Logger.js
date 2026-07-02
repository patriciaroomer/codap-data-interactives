export default class Logger {
    
    static logger = document.getElementById("logger");

    static log(msg) {
        Logger.logger.classList.remove("hidden");
        Logger.logger.textContent = msg;
    }

    static hide() {
        Logger.logger.classList.add("hidden");
        Logger.logger.textContent = "";
    }
}