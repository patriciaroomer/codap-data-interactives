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
        this.extendInputForm(name);
    }

    addData(name, values, clazz) {
        this.data.add({ name: name, values: values, class: clazz });
    }

    extendInputForm(attr) {
        const n = this.attributes.size;
        const labelId = "trainLabel" + n;
        const selectId = "trainSelect" + n;
        const style = "min-width:110px;";         
    
        document.getElementById("inputFormTrain").innerHTML += `<label id=${labelId} style=${style}>${attr}</label><select id=${selectId}><option value="nein">no</option><option value="ja">yes</option>`;
    }
}