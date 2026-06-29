import PearsonSimilarity from "../similarity/measures/PearsonSimilarity.js";
import Sociogram from "./Sociogram.js";

export default class PearsonSociogram extends Sociogram {
    constructor(interactionMatrix) {
        super(interactionMatrix);
        this.similarityMatrix = this.createSimilarityMatrix();
        this.similarityThreshold = 0.5;
        this.draw();
    }

    computeSimilarity(r1, r2) {
        return PearsonSimilarity.compute(r1, r2);
    }

    normalizeSimilarity(similarity) {
        return (similarity + 1) / 2;
    }

    getDesiredDistance(similarity) {
        return Math.pow(1 - similarity, 2) * this.scale;
    }
}