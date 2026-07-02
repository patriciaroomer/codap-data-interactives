import CaseTable from "../codap/CaseTable.js";
import DataContext from "../codap/DataContext.js";
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
        const dimensions = { width: 150, height: 150 };

        await DataContext.create(Codap.DC_CLASSES, ["name"]);
        await DataContext.create(Codap.DC_ATTRS, ["name"]);
        await new CaseTable(Codap.DC_CLASSES, this.classes, dimensions).create();
        await new CaseTable(Codap.DC_ATTRS, this.attributes, dimensions).create();
    }
}