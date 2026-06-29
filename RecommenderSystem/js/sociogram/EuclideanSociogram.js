import EuclideanSimilarity from "../similarity/measures/EuclideanSimilarity.js";
import Sociogram from "./Sociogram.js";

export default class EuclideanSociogram extends Sociogram {
    constructor(interactionMatrix) {
        super(interactionMatrix);
        this.similarityMatrix = this.createSimilarityMatrix();
        this.similarityThreshold = 0.5;
        this.draw();
    }

    computeSimilarity(r1, r2) {
        return EuclideanSimilarity.compute(r1, r2);
    }

    normalizeSimilarity(similarity) {
        const values = [...this.similarityMatrix.values()];
        const min = Math.min(...values);
        const max = Math.max(...values);
        if (max === min) return 0.5;
        return (similarity - min) / (max - min);
    }

    getDesiredDistance(similarity) {
        return Math.pow(1 - similarity, 2) * this.scale;
    }
}