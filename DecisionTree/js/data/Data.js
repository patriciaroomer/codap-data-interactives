import Parameters from "./Parameters.js";

export default class Data {
    constructor() {
        this.parameters = new Parameters();
    }

    addAttribute(name) {
        if (!name || this.parameters.attributes.includes(name)) return;
        this.parameters.addAttribute(name);

        this.form.innerHTML +=
            `<label>${name}</label>` +
            `<select>` +
                `<option value="yes">Yes</option>` +
                `<option value="no">No</option>` +
            `</select>`
    }

    addData(name) {
        const row = {};
        row.Name = name;

        let i = 0;
        for (const dropdown of this.form.getElementsByTagName("select")) {
            const attr = this.parameters.attributes[i];
            row[attr] = dropdown.value;
            i++;
        }
        return row;
    }

    getCurrentData() {
        if (!this.data || !this.data.length) return null;
        const last = this.data.length - 1;
        return this.data[last];
    }
}