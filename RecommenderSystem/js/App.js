import DataListener from "./ui/DataListener.js";
import RatingsListener from "./ui/RatingsListener.js";
import RecommendListener from "./ui/RecommendListener.js";

export default class App {
    start() {
        new DataListener();
        new RatingsListener();
        new RecommendListener();
    }
}