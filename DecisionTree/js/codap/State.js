import CODAPConnect from "./CODAPConnect.js";
import DataContext from "./DataContext.js";


// Reloads the plugin state when importing as a .codap file
export default class State {

    static state;
    static classes;
    static attributes;
    static trainingData;
    static testingData;

    static async reload() {
        await State.determineState();
        await State.reloadClasses();
        await State.reloadAttributes();
        await State.reloadTrainingData();
        await State.reloadTestingData();
    }

    static async determineState() {
        const classesExist = await DataContext.exists("Classes");
        const attributesExist = await DataContext.exists("Attributes");
        const trainingDataExists = await DataContext.exists("Training data");
        const trained = await DataContext.exists("TRAINED");
        const testingDataExists = await DataContext.exists("Testing data");

        if (!classesExist && !attributesExist) {
            State.state = "UNINITIALIZED";
        } else {
            State.state = "INITIALIZED";
        }
        if (trainingDataExists) {
            State.state = "TRAINING";
        }
        if (trained && trained === 1) {
            State.state = "TRAINED";
        }
        if (testingDataExists) {
            State.state = "TESTING";
        }
    }

    static async reloadClasses() {
        const response = await DataContext.getCases("Classes");
        if (!response) return;

        const classes = [];

        for (const c of response.values.cases) {
            classes.push(c.case.values["name"]);
        }

        State.classes = classes;
    }
    
    static async reloadAttributes() {
        const response = await DataContext.getCases("Attributes");
        if (!response) return;

        const attributes = [];

        for (const c of response.values.cases) {
            attributes.push(c.case.values["name"]);
        }

        State.attributes = attributes;
    }

    static async reloadTrainingData() {
        const response = await DataContext.getCases("Training data");
        if (!response) return;
        
        const data = [];
        
        for (const c of response.values.cases) {
            data.push(c.case.values);    
        }
        
        State.trainingData = data;
    }

    static async reloadTestingData() {
        const response = await DataContext.getCases("Testing data");
        if (!response) return;

        const data = [];

        for (const c of response.values.cases) {
            data.push(c.case.values);
        }

        State.testingData = data;
    }
}