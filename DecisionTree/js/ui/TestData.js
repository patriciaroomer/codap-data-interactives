import Data from "./Data.js";

export default class TestData extends Data {
    constructor() {
        super();
        this.card = document.getElementById("testCard"); 
        this.form = document.getElementById("inputFormTest"); 
        this.data = [];
    }

    addData() {
        this.data.push(super.addData());
    }
}