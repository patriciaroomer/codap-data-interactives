import CaseTable from "../codap/CaseTable.js";
import DataContext from "../codap/DataContext.js";
import CSVParser from "../csv/CSVParser.js";
import Sociogram from "../sociogram/Sociogram.js";
import Logger from "./Logger.js";
import RatingsListener from "./RatingsListener.js";
import RecommendListener from "./RecommendListener.js";
import SociogramListener from "./SociogramListener.js";

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
        Logger.hide();

        const parser = new CSVParser();
        try {
            await parser.parse(csv);
        } catch (error) {
            Logger.log(error.message);
            return;
        }


        const attributes = parser.data.attributes;
        const entries = parser.data.entries;
        
        await DataContext.create("Data", attributes);
        await new CaseTable("Data", entries, { width: 250, height: 1065 }).create();

        RatingsListener.data = parser.data;
        this.createUserSelects(parser.data.getUsers());
        this.createKSelect(parser.data.getItems());

        await RecommendListener.recommend();
        await SociogramListener.drawSociogram();
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
}