import DataListener from "./ui/DataListener.js";
import RatingsListener from "./ui/RatingsListener.js";

export default class App {
    start() {
        new DataListener();
        new RatingsListener();
    }
}