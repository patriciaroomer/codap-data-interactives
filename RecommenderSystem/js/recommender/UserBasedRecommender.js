import Recommender from "./Recommender.js";

export default class UserBasedRecommender extends Recommender {

    constructor(interactionMatrix) {
        super(interactionMatrix);
    }

    recommend(target, measure, k) {
        const [ similarities, aggregated, alreadyRated ] = super.recommend(target, measure, k);
        const scores = new Map();

        for (const [ otherUser, sim ] of aggregated ) {
            for (const [ item, rating ] of this.userLookup.get(otherUser)) {
                if (alreadyRated.has(item)) continue;
                if (!scores.has(item)) scores.set(item, { total: 0, simSum: 0});
                scores.get(item).total += sim * rating;
                scores.get(item).simSum += sim;
            }
        }

        const predicted = new Map();
        for (const [ item, { total, simSum }] of scores) {
            predicted.set(item, total / simSum);
        }
        return this.rank(predicted, k);
    }

    computeSimilarities(user, measure) {
        const similarities = new Map();
        const candidates = this.getCandidates(user);
        
        for (const otherUser of candidates) {
            const [ ratings, otherRatings ] = this.interactionMatrix.getUserVectors(user, otherUser);
            const similarity = this.computeSimilarity(ratings, otherRatings, measure);
            similarities.set([ user, otherUser ], similarity);
        }

        return similarities;
    }

    getCandidates(targetUser) {
        const candidates = new Set();
        const items = this.userLookup.get(targetUser);

        for (const item of items.keys()) {
            const users = this.itemLookup.get(item);
            
            for (const user of users.keys()) {
                if (user !== targetUser) {
                    candidates.add(user);
                }
            }
        }
        return [...candidates];
    }
}