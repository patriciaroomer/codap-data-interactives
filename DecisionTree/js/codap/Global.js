import CODAPConnect from "./CODAPConnect.js";

export default class Global {

    static async create(name, value) {
        const response = await CODAPConnect.sendRequest({
            action: "create",
            resource: "global",
            values: {
                name: name,
                value: value
            }
        });
        return response;
    }

    static async get(name) {
        const response = await CODAPConnect.sendRequest({
            action: "get",
            resource: `global[${name}]`
        });
        if (!response.success) return;
        return response;
    }

    static async update(name, value) {
        if (!Global.exists(name)) return;

        const response = await CODAPConnect.sendRequest({
            action: "update",
            resource: `global[${name}]`,
            values: { value: value }
        });
        if (!response.success) return;
        return response;
    }

    static async exists(name) {
        const response = await CODAPConnect.sendRequest({
            action: "get",
            resource: `global[${name}]`
        });
        return response.success;
    }
}