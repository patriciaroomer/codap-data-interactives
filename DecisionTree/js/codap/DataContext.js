import CODAPConnect from "./CODAPConnect.js";

export default class DataContext {

    static async create(name, attrs, callback) {
        if (DataContext.exists(name)) {
            await DataContext.delete(name);
        }

        const response = await CODAPConnect.sendRequest({
            action: "create",
            resource: "dataContext",
            values: {
                name: name,
                label: name,
                collections: [{ name: name, attrs: DataContext.toAttrs(attrs) }]
            }
        });
        if (callback) callback();
        return response;
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