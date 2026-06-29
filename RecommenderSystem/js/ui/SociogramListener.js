import CODAPConnect from "../codap/CODAPConnect.js";
import InteractionMatrix from "../recommender/InteractionMatrix.js";
import CosineSociogram from "../sociogram/CosineSociogram.js";
import EuclideanSociogram from "../sociogram/EuclideanSociogram.js";
import PearsonSociogram from "../sociogram/PearsonSociogram.js";

export default class SociogramListener {
    constructor() {
        this.select = document.getElementById("sociogramSelect");
        this.addListener();
    }

    addListener() {
        this.select.addEventListener("change", async () => {
            const measure = this.select.value;
            let sociogram;

            const cases = await CODAPConnect.getCases("Data");
            if (!cases) return;
            const interactionMatrix = new InteractionMatrix(cases);

            switch (measure) {
                case "Cosine":
                    sociogram = new CosineSociogram(interactionMatrix);
                    break;
                case "Pearson":
                    sociogram = new PearsonSociogram(interactionMatrix);
                    break;
                case "Euclidean":
                    sociogram = new EuclideanSociogram(interactionMatrix);
                    break;
                default:
                    return;
            }   

        });
    }
}