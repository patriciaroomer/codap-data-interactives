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
            const recommendations = await this.recommend();
            this.showRecommendations(recommendations);
        });
    }

    async recommend() {
        const cases = await CODAPConnect.getCases("Data");
        if (!cases) return [];
        
        const user = this.userSelect.value;
        const subject = this.subjectSelect.value;
        const measure = this.similaritySelect.value;
        
        let recommender;
        const interactionMatrix = new InteractionMatrix(cases);

        if (subject === "Users") recommender = new UserBasedRecommender(interactionMatrix);
        else recommender = new ItemBasedRecommender(interactionMatrix);

        return recommender.recommend(user, measure);
    }

    showRecommendations(recommendations) {
        const tbody = document.querySelector("#recommendTable tbody");
        tbody.replaceChildren();

        for (const rec of recommendations) {
            const row = document.createElement("tr");
            row.innerHTML = `<td>${rec}</td>`;
            tbody.appendChild(row);
        }
    }


}