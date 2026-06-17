import CaseTable from "../codap/CaseTable.js";
import CODAPConnect from "../codap/CODAPConnect.js";
import Codap from "../constants/Codap.js";
import ID3 from "../decision-tree/ID3.js";
import Data from "./Data.js";
import Parameters from "./Parameters.js";

export default class TrainingData extends Data {
    constructor() {
        super();

        this.card = document.getElementById("trainCard");
        this.form = document.getElementById("inputFormTrain");
        this.form.innerHTML = "";

        this.options = document.getElementById("classSelect");
        this.options.innerHTML = "";
        this.dropdown = document.getElementById("classDropdown");
        this.dropdown.style.visibility = "hidden";
        
        this.data = [];
    }

    addData(name) {
        const row = super.addData(name);
        row.Class = document.getElementById("classSelect").value;
        this.data.push(row);
    }

    addClass(name) {
        if (!name || this.parameters.classes.includes(name)) return;
        this.parameters.addClass(name);
        
        this.options.innerHTML = this.options.innerHTML + `<option>${name}</option>`;
        this.dropdown.style.visibility = "visible";
        this.options.value = name;
    }

    async persist() {
        const attributes = [];
        attributes.push("Name");
        for (const a of this.parameters.attributes) {
            attributes.push(a);
        }
        attributes.push("Class");
        
        const dimensions = { width: Codap.CT_DATA_WIDTH, height: Codap.CT_DATA_HEIGHT };

        await CODAPConnect.createDataContext(Codap.DC_TRAIN, attributes);
        await new CaseTable(Codap.DC_TRAIN, this.data, dimensions).create();
    }
}