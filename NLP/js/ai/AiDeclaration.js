import CODAPConnect from "../codap/CODAPConnect.js";

export default class AiDeclaration {

    static async create() {
        await AiDeclaration.delete();

        await CODAPConnect.sendRequest({
            action: "create",
            resource: "component",
            values: {
                type: "text",
                name: "AiDeclaration",
                title: "How does this plugin use AI?",
                dimensions: {
                    width: 500, height: 200
                },
                position: "bottom",
                cannotClose: true,
                isVisible: true,
                text:   
                    `When executing "Text Classification", this plugin sends a request to a Hugging Face 🤗 ` +
                    `language model for that specific classification task. For each classification type ` +
                    `(sentiment, emotion, topic), a different language model is used. These models are ` +
                    `linked in the info boxes, which you can find next to the checkboxes of the respective classification tasks. The preprocessed text, ` +
                    `displayed in the second text box, is sent to the responsible language models. ` +
                    `The models have each been trained on specific data and calculate scores for different classes. ` +
                    `These scores are then ranked from highest to lowest and the best five classes are sent ` +
                    `to this plugin to display in the case table.`
                }
        });
    }

    static async delete() {
        await CODAPConnect.sendRequest({
            action: "delete",
            resource: "component[AiDeclaration]"
        });
    }
}