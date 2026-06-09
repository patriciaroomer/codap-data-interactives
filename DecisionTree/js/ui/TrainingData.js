import ID3 from "../decision-tree/ID3.js";
import Data from "./Data.js";

export default class TrainingData extends Data {
    constructor() {
        super();
        this.card = document.getElementById("trainCard");
        this.form = document.getElementById("inputFormTrain");
        this.data = [];
    }

    addClass() {
        const name = document.getElementById("className").value;
        if (!name || this.classes.includes(name)) return;
        this.classes.push(name);

        const options = document.getElementById("classSelect");
        const dropdown = document.getElementById("classDropdown");
        
        options.innerHTML = options.innerHTML + `<option>${name}</option>`;
        dropdown.style.visibility = "visible";
    }

    addData() {
        const row = super.addData();

        const selectedClass = document.getElementById("classSelect").value;
        row.targetClass = selectedClass;
        this.data.push(row);
    }
}