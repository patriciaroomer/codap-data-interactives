import CosineSimilarity from "./CosineSimilarity.js";
import VectorHelper from "../VectorHelper.js";

export default class PearsonSimilarity {

    static scale = 3;

    static compute(v, w) {
        // mathemetically undefined
        if (v.length < 2 || w.length < 2) return 0;

        const vCentered = VectorHelper.center(v);
        const wCentered = VectorHelper.center(w);
        return CosineSimilarity.compute(vCentered, wCentered);
    }
}