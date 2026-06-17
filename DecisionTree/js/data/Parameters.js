import CaseTable from "../codap/CaseTable.js";
import CODAPConnect from "../codap/CODAPConnect.js";
import Codap from "../constants/Codap.js";

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

        await CODAPConnect.createDataContext(Codap.DC_CLASSES, ["name"]);
        await CODAPConnect.createDataContext(Codap.DC_ATTRS, ["name"]);
        await new CaseTable(Codap.DC_CLASSES, this.classes, dimensions).create();
        await new CaseTable(Codap.DC_ATTRS, this.attributes, dimensions).create();
    }
}