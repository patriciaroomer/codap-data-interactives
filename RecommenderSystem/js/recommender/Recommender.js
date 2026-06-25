import CosineSimilarity from "../similarity/measures/CosineSimilarity.js";
import PearsonSimilarity from "../similarity/measures/PearsonSimilarity.js";
import EuclideanSimilarity from "../similarity/measures/EuclideanSimilarity.js";

export default class Recommender {
    constructor(interactionMatrix) {
        this.interactionMatrix = interactionMatrix;
        this.userLookup = interactionMatrix.userLookup;
        this.itemLookup = interactionMatrix.itemLookup;
    }

    recommend(target, measure) {
        const similarities = this.computeSimilarities(target, measure);
        const aggregated = this.aggregate(similarities);
        const alreadyRated = new Set(this.userLookup.get(target).keys());
        return [ similarities, aggregated, alreadyRated ];
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

    aggregate(similarities) {
        const aggregated = new Map();
        
        for (const [ pair, sim ] of similarities) {
            const other = pair[1];
            if (!aggregated.has(other)) {
                aggregated.set(other, { total: 0, count: 0 });
            }
            aggregated.get(other).total += sim;
            aggregated.get(other).count += 1;
        }

        const averaged = new Map();
        for (const [ other, { total, count }] of aggregated) {
            averaged.set(other, total / count);
        }
        return averaged;
    }
    
    rank(similarities) {
        const sims = Array.from(similarities.values());
        const pairs = Array.from(similarities.keys());
        const [ sortedSims, sortedPairs ] = this.reverseInsertionSort(sims, pairs);
        return sortedPairs;
    }

    reverseInsertionSort(sims, pairs) {
        for (let i = 1; i < sims.length; i++) {
            let keySim = sims[i];
            let keyPair = pairs[i];
            let j = i - 1;

            while (j >= 0 && sims[j] < keySim) {
                sims[j+1] = sims[j];
                pairs[j+1] = pairs[j];
                j--;
            }
            sims[j+1] = keySim;
            pairs[j+1] = keyPair;
        }
        return [ sims, pairs ];
    }

    
}