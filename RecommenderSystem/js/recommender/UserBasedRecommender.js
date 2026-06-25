import Recommender from "./Recommender.js";

export default class UserBasedRecommender extends Recommender {

    constructor(interactionMatrix) {
        super(interactionMatrix);
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