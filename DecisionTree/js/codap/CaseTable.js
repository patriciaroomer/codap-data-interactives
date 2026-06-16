import CODAPConnect from "./CODAPConnect.js";

export default class CaseTable {

    static tables = [ "Classes", "Attributes" ];

    constructor(dataContext, entries, dimensions) {
        this.dataContext = dataContext;
        this.entries = CaseTable.toEntries(entries);
        this.dimensions = dimensions;
    }

    get resource() {
        return `dataContext[${this.dataContext}].collection[${this.dataContext}].case`;
    }

    async create() {
        await this.clearExistingCases();
        await this.writeEntries();
        await this.createComponent();
    }

    async clearExistingCases() {
        await CODAPConnect.sendRequest({
            action: "delete",
            resource: `dataContext[${this.dataContext}].case`
        });
    }

    async writeEntries() {
        const response = await CODAPConnect.sendRequest({
            action: "create",
            resource: this.resource,
            values: this.entries
        });

        return response?.success === true;
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
        return response?.success === true;
    }

    static async exists(name) {
        const response = await CODAPConnect.sendRequest({
            action: "get",
            resource: `component[${name}]`
        });
        return response?.success === true;
    }

    static async hide(name) {
        await CODAPConnect.sendRequest({
            action: "update",
            resource: `component[${name}]`,
            values: {
                isVisible: false
            }
        });
    }

    static async hideAll() {
        for (const t of CaseTable.tables) {
            await CaseTable.hide(t);
        }
    }

    static toEntries(items, key = "name") {
        return items.map(item =>
            typeof item === "string"
                ? { values: { [key]: item } }
                : { values: item }
        );
    }
}