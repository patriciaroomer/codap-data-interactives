import EuclideanSimilarity from "../similarity/measures/EuclideanSimilarity.js";
import Sociogram from "./Sociogram.js";

export default class EuclideanSociogram extends Sociogram {
    constructor(interactionMatrix) {
        super(interactionMatrix);
    }

    computeSimilarity(r1, r2) {
        return EuclideanSimilarity.compute(r1, r2);
    }
}