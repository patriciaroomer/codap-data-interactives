import CODAPConnect from "./CODAPConnect.js";

export default class Graph {

    static async create() {
        const response = await CODAPConnect.sendRequest({
            action: "create",
            resource: "component",
            values: {
                type: "graph",
                name: "KMeansGraph",
                dimensions: {
                    width: CODAPConnect.WIDGET_WIDTH,
                    height: 320
                },
                position: "top",
                xAttributeName: "x",
                yAttributeName: "y",
                legendAttributeName: "cluster",
                enableNumberToggle: false
            }
        });
    }
}