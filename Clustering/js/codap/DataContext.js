import CODAPConnect from "./CODAPConnect.js";

export default class DataContext {

    static DATACONTEXT = "KMeansDemo";
    static COLLECTION = "Points";

    static async create(name, attrs) {
        if (DataContext.exists(name)) {
            await DataContext.delete(name);
        }

        const response = await CODAPConnect.sendRequest({
            action: "create",
            resource: "dataContext",
            values: {
                name: name,
                label: name,
                collections: [{ name: name, attrs: attrs }]
            }
        });
        return response;
    }

    static async createDefault() {
        await CODAPConnect.sendRequest({
            action: "create",
            resource: "dataContext",
            values: {
                name: DataContext.DATACONTEXT,
                title: "k-means Demo",
                collections: [{
                    name: DataContext.COLLECTION,
                    title: "Points",
                    labels: { singleCase: "Point", pluralCase: "Points"},
                    attrs : [
                        { name: "pid", type: "numeric", precision: 0 },
                        { name: "x", type: "numeric", precision: 4 },
                        { name: "y", type: "numeric", precision: 4 },
                        { name: "cluster", type: "categorical" },
                        { name: "iteration", type: "numeric", precisiom: 0 }
                    ]
                }]
            }
        });
    }

    static async delete(name) {
        const response = await CODAPConnect.sendRequest({
            action: "delete",
            resource: `dataContext[${name}]`
        });
        return response;
    }

    static async get(name) {
        const dataContext = await CODAPConnect.sendRequest({
            action: "get",
            resource: `dataContext[${name}]`
        });
        return dataContext;
    }

    static async getCases(dataContext, collection = dataContext) {
		const exists = await DataContext.exists(dataContext);
		if (!exists) return;

		const response = await CODAPConnect.sendRequest({
			action: "get",
			resource: `dataContext[${dataContext}].collection[${collection}].allCases`
		});
		return response;
	}

    static async exists(name) {
        const dataContext = await DataContext.get(name);
        return dataContext?.success;
    }

    static async anyExists() {
        const dataContextList = await CODAPConnect.sendRequest({
            action: "get",
            resource: "dataContextList"
        });
        const dataContexts = dataContextList?.values || [];
        const nonDefaultContexts = dataContexts.filter(
            d => d.name !== "default"
        );
        return nonDefaultContexts.length > 0;
    }

    static toAttrs(names, type = "nominal") {
        return names.map(name => ({ name, type }));	
    }
}