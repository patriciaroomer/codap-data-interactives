import CODAPConnect from "./CODAPConnect.js";
import DataContext from "./DataContext.js";

export default class CaseTable {

    constructor(dataContext, entries) {
        this.dataContext = dataContext;
        this.entries = CaseTable.toEntries(entries);
        this.dimensions = { height: 300, width: 1000 };
    }

    get resource() {
        return `dataContext[${this.dataContext}].collection[${this.dataContext}].case`;
    }

    async create(name, dataContext) {
        await this.clear();
        await this.write();
        await this.createComponent();
    }

    async clear() {
        const exists = await DataContext.exists(this.dataContext);
        if (!exists) return;

        const response = await CODAPConnect.sendRequest({
            action: "delete",
            resource: `dataContext[${this.dataContext}].collection[${this.dataContext}].allCases`,
        });
        return response;
    }

    async write() {
        const response = await CODAPConnect.sendRequest({
            action: "create",
            resource: this.resource,
            values: this.entries
        });
        return response;
    }

    async createComponent() {
        const response = await CODAPConnect.sendRequest({
            action: "create",
            resource: "component",
            values: {
                type: "caseTable",
                name: this.dataContext,
                dataContext: this.dataContext,
                isVisible: true,
                dimensions: this.dimensions
            }
        });
        return response;
    }

    static async exists(name) {
        const response = await CODAPConnect.sendRequest({
            action: "get",
            resource: `component[${name}]`
        });
        return response?.success;
    }

    static toEntries(items, key = "name") {
        return items.map(item => {
            if (typeof item === "string") return { values: { [key]: item } };
            if (item.values !== undefined) return item;  // already wrapped
            return { values: item };
        });
    }
}