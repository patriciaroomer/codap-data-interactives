import Recommender from "./Recommender.js";

export default class ItemBasedRecommender extends Recommender {

    constructor(interactionMatrix) {
        super(interactionMatrix);
    }

    computeSimilarities(user, measure) {
        const similarities = new Map();

        const seedItems = this.userLookup.get(user).keys();
        for (const item of seedItems) {
            const candidates = this.getCandidates(item);

            for (const otherItem of candidates) {
                const [ratings, otherRatings] = this.interactionMatrix.getItemVectors(item, otherItem);
                const similarity = this.computeSimilarity(ratings, otherRatings, measure);
                similarities.set([ item, otherItem ], similarity);
            }
        }
        return similarities;
    }

    getCandidates(targetItem) {
        const candidates = new Set();
        const users = this.itemLookup.get(targetItem);

        for (const user of users.keys()) {
            const items = this.userLookup.get(user);

            for (const item of items.keys()) {
                if (item !== targetItem) {
                    candidates.add(item);
                }
            }
        }
        return [...candidates];
    }
}