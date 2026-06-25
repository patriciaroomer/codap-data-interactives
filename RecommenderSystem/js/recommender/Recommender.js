import CosineSimilarity from "../similarity/measures/CosineSimilarity.js";
import PearsonSimilarity from "../similarity/measures/PearsonSimilarity.js";
import EuclideanSimilarity from "../similarity/measures/EuclideanSimilarity.js";

export default class Recommender {
    constructor(interactionMatrix) {
        this.interactionMatrix = interactionMatrix;
        this.userLookup = interactionMatrix.userLookup;
        this.itemLookup = interactionMatrix.itemLookup;
    }

    recommend(user, measure) {
        const similarities = this.computeSimilarities(user, measure);
        
        // TODO: Rank similarities, then return recommendations.
        console.log(similarities);
        return similarities;
    }

    computeSimilarity(targetRatings, otherRatings, measure) {
        let similarity = 0;

        switch (measure) {
            case "Cosine":
                similarity = CosineSimilarity.compute(targetRatings, otherRatings);
                break;
            case "Pearson":
                similarity = PearsonSimilarity.compute(targetRatings, otherRatings);
                break;
            case "Euclidean":
                similarity = EuclideanSimilarity.compute(targetRatings, otherRatings);
                break;
            default:
                console.warn("Not a valid similarity measure.");
        }

        return similarity;
    }

    
}