import CODAPConnect from "../codap/CODAPConnect.js";
import Recommender from "../recommender/Recommender.js";
import InteractionMatrix from "../recommender/InteractionMatrix.js";
import UserBasedRecommender from "../recommender/UserBasedRecommender.js";
import ItemBasedRecommender from "../recommender/ItemBasedRecommender.js";

export default class RecommendListener {

    static subjectSelect = document.getElementById("subjectSelect");
    static measureSelect = document.getElementById("measureSelect");
    static userSelect = document.getElementById("recommendSelect");
    static kSelect = document.getElementById("kSelect");

    constructor() {
        this.selects = [RecommendListener.subjectSelect, RecommendListener.measureSelect, RecommendListener.userSelect, RecommendListener.kSelect];
        this.addSelectListeners();
    }

    addSelectListeners() {
        for (const select of this.selects) {
            select.addEventListener("change", async () => {
                const recommendations = await RecommendListener.recommend();
            });
        }
    }

    static async recommend() {
        const cases = await CODAPConnect.getCases("Data");
        if (!cases) return [];
        
        const subject = RecommendListener.subjectSelect.value;
        const measure = RecommendListener.measureSelect.value;
        const user = RecommendListener.userSelect.value;
        const k = RecommendListener.kSelect.value;
        
        let recommender;
        const interactionMatrix = new InteractionMatrix(cases);

        if (subject === "Users") recommender = new UserBasedRecommender(interactionMatrix);
        else recommender = new ItemBasedRecommender(interactionMatrix);
        
        const recommendations = recommender.recommend(user, measure, k);
        RecommendListener.showRecommendations(recommendations);
    }

    static showRecommendations(recommendations) {
        const tbody = document.querySelector("#recommendTable tbody");
        tbody.replaceChildren();

        for (const rec of recommendations) {
            const row = document.createElement("tr");
            row.innerHTML = `<td>${rec}</td>`;
            tbody.appendChild(row);
        }
    }


}