import VectorHelper from "./VectorHelper.js";

export default class CosineSimilarity {

    static compute(v, w) {
        const dot = VectorHelper.dot(v, w);
        const vLength = VectorHelper.length(v);
        const wLength = VectorHelper.length(w);
        return dot / (vLength * wLength);
    }
}