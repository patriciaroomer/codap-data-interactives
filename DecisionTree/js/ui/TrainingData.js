export default class TrainingData {
    constructor() {
        this.classes = new Set();
        this.attributes = new Set();
        this.data = [];
    }

    addClass() {
        const name = document.getElementById("className").value;
        if (!name) return;
        this.classes.add(name);
    }

    addAttribute() {
        const name = document.getElementById("attrName").value;
        if (!name) return;
        this.attributes.add(name);
    }

    addData() {
        const form = document.getElementById("inputFormTrain");
        const name = document.getElementById("dataName").value;

        const values = [];
        for (const dropdown of document.getElementsByClassName("trainSelect")) {
            values.add(dropdown.value);
        }

        const c = document.getElementById("classSelect").value;

        this.data.add({ name: name, values: values, class: c });
        console.log(this.data);
    }

    applyAttributes() {
        const form = document.getElementById("inputFormTrain");
    
        let i = 1;
        for (const attr of this.attributes) {

            form.innerHTML += 
                `<label class="trainLabel">${attr}</label>` +
                `<select class="trainSelect"` +
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