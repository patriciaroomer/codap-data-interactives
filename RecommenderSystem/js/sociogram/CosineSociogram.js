import CosineSimilarity from "../similarity/measures/CosineSimilarity.js";
import Sociogram from "./Sociogram.js";

export default class CosineSociogram extends Sociogram {
    constructor(interactionMatrix) {
        super(interactionMatrix);
        this.similarityMatrix = this.createSimilarityMatrix();
        this.similarityThreshold = 0.7;
        this.draw();
    }

    computeSimilarity(r1, r2) {
        return CosineSimilarity.compute(r1, r2);
    }

    normalizeSimilarity(similarity) {
        const values = [...this.similarityMatrix.values()];
        const min = Math.min(...values);
        const max = Math.max(...values);
        if (min === max) return 0.5;
        return 0.1 + 0.8 * (similarity - min) / (max - min);
    }

    getDesiredDistance(similarity) {
        return Math.pow(1 - similarity, 1) * this.scale * 2;
    }
}