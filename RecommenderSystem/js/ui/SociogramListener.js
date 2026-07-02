import DataContext from "../codap/DataContext.js";
import InteractionMatrix from "../recommender/InteractionMatrix.js";
import CosineSimilarity from "../similarity/measures/CosineSimilarity.js";
import EuclideanSimilarity from "../similarity/measures/EuclideanSimilarity.js";
import PearsonSimilarity from "../similarity/measures/PearsonSimilarity.js";
import Sociogram from "../sociogram/Sociogram.js";

export default class SociogramListener {
    constructor() {
        this.measure = document.getElementById("sociogramSelect");
        this.threshold = document.getElementById("threshold");
        this.addListeners();
    }

    addListeners() {
        this.measure.addEventListener("change", async () => {
            await SociogramListener.drawSociogram();
        });
        this.threshold.addEventListener("change", async () => {
            await SociogramListener.drawSociogram();
        })
    }

    static async drawSociogram() {
        const cases = await DataContext.getCases("Data");
        if (!cases) return;

        const interactionMatrix = new InteractionMatrix(cases);
        const measure = document.getElementById("sociogramSelect").value;
        
        let similarityMeasure;
        switch (measure) {
            case "Cosine":
                similarityMeasure = CosineSimilarity;
                break;
            case "Pearson":
                similarityMeasure = PearsonSimilarity;
                break;
            case "Euclidean":
                similarityMeasure = EuclideanSimilarity;
                break;
            default:
                return;
        }

        let threshold = document.getElementById("threshold").value;
        if (!threshold) threshold = similarityMeasure.threshold;

        new Sociogram(interactionMatrix, similarityMeasure, threshold).draw();
    }
}