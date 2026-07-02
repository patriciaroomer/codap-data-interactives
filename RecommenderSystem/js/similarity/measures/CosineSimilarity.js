import VectorHelper from "../VectorHelper.js";

export default class CosineSimilarity {

    static scale = 8;
    static threshold = 0.9;

    static compute(v, w) {
        // mathematically undefined
        if (v.length < 2 || w.length < 2) return 0;

        const dot = VectorHelper.dot(v, w);
        const vLength = VectorHelper.length(v);
        const wLength = VectorHelper.length(w);

        const denominator = vLength * wLength;
        if (denominator === 0) return 0;

        return dot / denominator;
    }

    static normalize(similarity) {
        return similarity;
    }
}