import CosineSimilarity from "../similarity/measures/CosineSimilarity.js";
import Sociogram from "./Sociogram.js";

export default class CosineSociogram extends Sociogram {
    constructor(interactionMatrix) {
        super(interactionMatrix);
    }

    computeSimilarity(r1, r2) {
        return CosineSimilarity.compute(r1, r2);
    }
}