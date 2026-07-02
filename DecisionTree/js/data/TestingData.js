import CaseTable from "../codap/CaseTable.js";
import DataContext from "../codap/DataContext.js";
import Codap from "../constants/Codap.js";
import UI from "../constants/UI.js";
import Data from "./Data.js";

export default class TestingData extends Data {
    constructor() {
        super();
        this.form = UI.TEST_FORM
        this.form.innerHTML = "";
        this.data = [];
        this.prediction = "";
    }

    addData(name) {
        this.data.push(super.addData(name));
    }

    async persist() {
        const attributes = [];
        attributes.push("Name");
        for (const a of this.parameters.attributes) {
            attributes.push(a);
        }
        attributes.push("Class");

        const dimensions = { width: Codap.CT_DATA_WIDTH, height: Codap.CT_DATA_HEIGHT };

        await DataContext.create(Codap.DC_TEST, attributes);
        await new CaseTable(Codap.DC_TEST, this.data, dimensions).create();
    }

    setPrediction(prediction) {
        const last = this.data.length - 1;
        this.data[last].Class = prediction;
    }
}