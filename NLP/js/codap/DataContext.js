import CODAPConnect from "./CODAPConnect.js";

export default class DataContext {

    static lastDataContext;

    static async create(name, attrs, callback) {
        const response = await CODAPConnect.sendRequest({
            action: "create",
            resource: "dataContext",
            values: {
                name: name,
                label: name,
                collections: [{ name: name, attrs: attrs }]
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

    static toAttrs(attrs, type = "nominal") {
    return attrs.map(attr => 
        typeof attr === "string" 
            ? { name: attr, type } 
            : attr 
    );
}
}