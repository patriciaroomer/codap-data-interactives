import ID3 from "../decision-tree/ID3.js";

export default class TrainingData {
    constructor() {
        this.classes = [];
        this.attributes = [];
        this.data = [];
        this.id3 = new ID3();
    }

    addClass() {
        const name = document.getElementById("className").value;
        if (!name) return;
        this.classes.push(name);
    }

    addAttribute() {
        const name = document.getElementById("attrName").value;
        if (!name) return;
        this.attributes.push(name);
    }

    addData() {
        const name = document.getElementById("dataName").value;
        const classValue = document.getElementById("classSelect").value;
        const row = {};

        let i = 0;
        for (const dropdown of document.getElementsByClassName("trainSelect")) {
            const attr = this.attributes[i];
            row[attr] = dropdown.value;
            i++;
        }

        row.targetClass = classValue;
        this.data.push(row);

        console.log(this.data);
    }

    applyAttributes() {
        const form = document.getElementById("inputFormTrain");
    
        let i = 1;

        for (const attr of this.attributes) {

            form.innerHTML += 
                `<label class="trainLabel">${attr}</label>` +
                `<select class="trainSelect">` +
                `<option value="no">No</option>` +
                `<option value="yes">Yes</option>` +
                `</select>`
        }

    }

    applyClasses() {
        const options = document.getElementById("classSelect");
        const dropdown = document.getElementById("classDropdown");
        dropdown.style.visibility = "visible";

        for (const c of this.classes) {
            options.innerHTML += `<option>${c}</option>`;
        }
    }
}