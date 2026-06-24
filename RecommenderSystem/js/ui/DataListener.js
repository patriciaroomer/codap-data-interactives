import CaseTable from "../codap/CaseTable.js";
import CODAPConnect from "../codap/CODAPConnect.js";
import CSVParser from "../csv/CSVParser.js";

export default class DataListener {

    constructor() {
        this.loadCsvButton = document.getElementById("loadCsvButton");
        this.loadExampleButton = document.getElementById("loadExampleButton");
        this.addListeners();
    }

    
    addListeners() {
        this.loadExampleButton.addEventListener("click", async () => {
            const example = await this.fetchExample();

            const parser = new CSVParser();
            await parser.parse(example);
            
            const attributes = parser.data.attributes;
            const entries = parser.data.entries;

            console.log("Attributes:", attributes);
            console.log("Entry keys:", Object.keys(entries[0]));
            
            await CODAPConnect.createDataContext("Data", attributes);
            await new CaseTable("Data", entries, { width: 500, height: 300 }).create();
        });
    }

    async fetchExample() {
        const path = "../RecommenderSystem/example.csv";
        const response = await fetch(path);
        const content = await response.text();
        return content;
    }
}