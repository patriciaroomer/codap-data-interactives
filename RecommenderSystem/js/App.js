import DataListener from "./ui/DataListener.js";
import RatingsListener from "./ui/RatingsListener.js";
import RecommendListener from "./ui/RecommendListener.js";
import SociogramListener from "./ui/SociogramListener.js";

export default class App {
    start() {
        new DataListener();
        new RatingsListener();
        new RecommendListener();
        new SociogramListener();
    }
}