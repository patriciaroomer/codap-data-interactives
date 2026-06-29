import PearsonSimilarity from "../similarity/measures/PearsonSimilarity.js";
import Sociogram from "./Sociogram.js";

export default class PearsonSociogram extends Sociogram {
    constructor(interactionMatrix) {
        super(interactionMatrix);
    }

    computeSimilarity(r1, r2) {
        return PearsonSimilarity.compute(r1, r2);
    }
}