export default class Data {
    constructor() {
        this.classes = [];
        this.attributes = [];
    }

    addAttribute() {
        const name = document.getElementById("attrName").value;
        if (!name || this.attributes.includes(name)) return;
        this.attributes.push(name);

        this.form.innerHTML +=
            `<label>${name}</label>` +
            `<select>` +
                `<option value="yes">Yes</option>` +
                `<option value="no">No</option>` +
            `</select>`
    }

    addData() {
        const name = this.card.querySelector(".dataName").value;
        const row = {};

        let i = 0;
        for (const dropdown of this.form.getElementsByTagName("select")) {
            const attr = this.attributes[i];
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