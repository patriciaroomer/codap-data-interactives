import CosineSimilarity from "./CosineSimilarity.js";
import VectorHelper from "./VectorHelper.js";

export default class PearsonSimilarity {

    static compute(v, w) {
        const vCentered = VectorHelper.center(v);
        const wCentered = VectorHelper.center(w);
        return CosineSimilarity.compute(v, w);
    }
}