import CaseTable from "../codap/CaseTable.js";
import CODAPConnect from "../codap/CODAPConnect.js";
import CSVParser from "../csv/CSVParser.js";
import InteractionMatrix from "../recommender/InteractionMatrix.js";
import EuclideanSimilarity from "../similarity/measures/EuclideanSimilarity.js";
import CosineSociogram from "../sociogram/CosineSociogram.js";
import EuclideanSociogram from "../sociogram/EuclideanSociogram.js";
import PearsonSociogram from "../sociogram/PearsonSociogram.js";
import Sociogram from "../sociogram/Sociogram.js";
import RatingsListener from "./RatingsListener.js";
import RecommendListener from "./RecommendListener.js";

export default class DataListener {

    constructor() {
        this.loadCsvButton = document.getElementById("loadCsvButton");
        this.loadExampleButton = document.getElementById("loadExampleButton");
        this.csvInput = document.getElementById("csvInput");
        this.userSelections = document.getElementsByClassName("userSelection");
        this.kSelection = document.getElementById("kSelect");
        this.addListeners();
    }

    addListeners() {
        this.addLoadCsvListener();
        this.addLoadExampleListener();
        this.addCsvInputListener();
    }
    
    addLoadCsvListener() {
        this.loadCsvButton.addEventListener("click", async () => {
            if (this.loadCsvButton.classList.contains("hidden")) return;

            const files = this.csvInput.files;
            if (!files) return;

            const file = files[0];
            if (!file) return;

            const csv = await file.text();
            await this.loadData(csv);
        })
    }

    addLoadExampleListener() {
        this.loadExampleButton.addEventListener("click", async () => {
            const example = await this.fetchExample();
            await this.loadData(example);
        });
    }

    addCsvInputListener() {
        this.csvInput.addEventListener("change", async (event) => {
            const files = event.target.files;
            if (!files || files.length === 0) {
                this.loadCsvButton.classList.add("locked");
                return;
            }

            const file = files[0];
            if (!file || !file.name.toLowerCase().endsWith(".csv")) {
                this.loadCsvButton.classList.add("locked");
                return;
            }

            this.loadCsvButton.classList.remove("locked");
        })
    }

    async loadData(csv) {
        const parser = new CSVParser();
        await parser.parse(csv);

        const attributes = parser.data.attributes;
        const entries = parser.data.entries;
        
        await CODAPConnect.createDataContext("Data", attributes);
        await new CaseTable("Data", entries, { width: 500, height: 300 }).create();

        RatingsListener.data = parser.data;
        this.createUserSelects(parser.data.getUsers());
        this.createKSelect(parser.data.getItems());

        await RecommendListener.recommend();
        await this.drawSociogram();
    }

    createUserSelects(users) {
        for (const selection of this.userSelections) {
            selection.classList.remove("hidden");
            const selects = selection.getElementsByTagName("select");

            for (const select of selects) {
                select.replaceChildren();
                for (const user of users) {
                    select.add(new Option(user));
                }
            }
        }
        RatingsListener.showRatings();
    }

    createKSelect(items) {
        this.kSelection.replaceChildren();
        for (let i = 1; i <= items.size; i++) {
            this.kSelection.add(new Option(i));
        }
    }

    async fetchExample() {
        const path = "../RecommenderSystem/example.csv";
        const response = await fetch(path);
        const content = await response.text();
        return content;
    }

    async drawSociogram() {
        const cases = await CODAPConnect.getCases("Data");
        if (!cases) return;

        const interactionMatrix = new InteractionMatrix(cases);
        const sociogram = new CosineSociogram(interactionMatrix);
    }
}