import CODAPConnect from "../codap/CODAPConnect.js";
import Recommender from "../recommender/Recommender.js";
import InteractionMatrix from "../recommender/InteractionMatrix.js";
import UserBasedRecommender from "../recommender/UserBasedRecommender.js";
import ItemBasedRecommender from "../recommender/ItemBasedRecommender.js";

export default class RecommendListener {
    constructor() {
        this.subjectSelect = document.getElementById("subjectSelect");
        this.similaritySelect = document.getElementById("similaritySelect");
        this.userSelect = document.getElementById("recommendSelect");
        this.recommendButton = document.getElementById("recommendButton"); 
        this.addListeners();
    }

    addListeners() {
        this.addButtonListener();
    }

    addButtonListener() {
        this.recommendButton.addEventListener("click", async () => {
            
            const cases = await CODAPConnect.getCases("Data");
            if (!cases) return;
            
            const interactionMatrix = new InteractionMatrix(cases);
            
            const user = this.userSelect.value;
            const subject = this.subjectSelect.value;
            const measure = this.similaritySelect.value;
            
            let recommender;
            if (subject === "Users") {
                recommender = new UserBasedRecommender(interactionMatrix);
            } else {
                recommender = new ItemBasedRecommender(interactionMatrix);
            }

            const recommendations = recommender.recommend(user, measure);
        });
    }
}