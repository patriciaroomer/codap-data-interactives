import CaseTable from "../codap/CaseTable.js";
import CODAPConnect from "../codap/CODAPConnect.js";

export default class Parameters {
    constructor() {
        this.classes = [];
        this.attributes = [];
    }

    addClass(name) {
        this.classes.push(name);
    }

    addAttribute(name) {
        this.attributes.push(name);
    }

    async persist() {
        const dimensions = { width: 150, height: 300 };

        await CODAPConnect.createDataContext("Classes", ["name"]);
        await CODAPConnect.createDataContext("Attributes", ["name"]);
        await new CaseTable("Classes", this.classes, dimensions).create();
        await new CaseTable("Attributes", this.attributes, dimensions).create();
    }
}