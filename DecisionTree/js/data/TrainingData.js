import CODAPConnect from "../codap/CODAPConnect.js";
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

    addClass() {
        const name = document.getElementById("className").value;
        if (!name || this.parameters.classes.includes(name)) return;
        this.parameters.addClass(name);
        
        this.options.innerHTML = this.options.innerHTML + `<option>${name}</option>`;
        this.dropdown.style.visibility = "visible";
        this.options.value = name;
    }

    addData() {
        const row = super.addData();
        const selectedClass = document.getElementById("classSelect").value;
        row.targetClass = selectedClass;
        this.data.push(row);
    }
}