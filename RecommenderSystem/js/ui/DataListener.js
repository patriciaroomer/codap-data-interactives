import CaseTable from "../codap/CaseTable.js";
import CODAPConnect from "../codap/CODAPConnect.js";
import CSVParser from "../csv/CSVParser.js";

export default class DataListener {

    constructor() {
        this.loadCsvButton = document.getElementById("loadCsvButton");
        this.loadExampleButton = document.getElementById("loadExampleButton");
        this.csvInput = document.getElementById("csvInput");
        this.addListeners();
    }

    addListeners() {
        this.addLoadCsvListener();
        this.addLoadExampleListener();
        this.addCsvInputListener();
    }
    
    addLoadCsvListener() {
        this.loadCsvButton.addEventListener("click", async () => {
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
    }

    async fetchExample() {
        const path = "../RecommenderSystem/example.csv";
        const response = await fetch(path);
        const content = await response.text();
        return content;
    }
}