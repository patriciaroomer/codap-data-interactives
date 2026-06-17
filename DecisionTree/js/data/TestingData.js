import CaseTable from "../codap/CaseTable.js";
import CODAPConnect from "../codap/CODAPConnect.js";
import Data from "./Data.js";

export default class TestingData extends Data {
    constructor() {
        super();
        
        this.card = document.getElementById("testCard"); 
        this.form = document.getElementById("inputFormTest"); 
        this.form.innerHTML = "";

        this.data = [];
        this.prediction = "";
    }

    addData(name) {
        this.data.push(super.addData(name));
    }

    async persist() {
        const dataContext = "Testing data";
        
        const attributes = [];
        attributes.push("Name");
        for (const a of this.parameters.attributes) {
            attributes.push(a);
        }
        attributes.push("Class");

        const dimensions = { width: 500, height: 300 };

        await CODAPConnect.createDataContext(dataContext, attributes);
        await new CaseTable(dataContext, this.data, dimensions).create();
    }

    setPrediction(prediction) {
        const last = this.data.length - 1;
        this.data[last].Class = prediction;
    }
}