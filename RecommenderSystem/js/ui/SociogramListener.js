import CODAPConnect from "../codap/CODAPConnect.js";
import InteractionMatrix from "../recommender/InteractionMatrix.js";
import CosineSimilarity from "../similarity/measures/CosineSimilarity.js";
import EuclideanSimilarity from "../similarity/measures/EuclideanSimilarity.js";
import PearsonSimilarity from "../similarity/measures/PearsonSimilarity.js";
import CosineSociogram from "../sociogram/CosineSociogram.js";
import EuclideanSociogram from "../sociogram/EuclideanSociogram.js";
import PearsonSociogram from "../sociogram/PearsonSociogram.js";
import Sociogram from "../sociogram/Sociogram.js";

export default class SociogramListener {
    constructor() {
        this.select = document.getElementById("sociogramSelect");
        this.addListener();
    }

    addListener() {
        this.select.addEventListener("change", async () => {
            await SociogramListener.drawSociogram();
        });
    }

    static async drawSociogram() {
        const cases = await CODAPConnect.getCases("Data");
            if (!cases) return;

            const interactionMatrix = new InteractionMatrix(cases);
            const measure = document.getElementById("sociogramSelect").value;

            switch (measure) {
                case "Cosine":
                    new Sociogram(interactionMatrix, CosineSimilarity).draw();
                    break;
                case "Pearson":
                    new Sociogram(interactionMatrix, PearsonSimilarity).draw();
                    break;
                case "Euclidean":
                    new Sociogram(interactionMatrix, EuclideanSimilarity).draw();
                    break;
                default:
                    return;
            }
    }
}