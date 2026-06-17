export default class CODAPConnect {
	static phone;

	static {
		this.phone = new iframePhone.IframePhoneRpcEndpoint(
			this.requestHandler, "data-interactive", window.parent
		);
	}

	static requestHandler(request, callback) {
		callback({ succes: true });
	}

	static sendRequest(request) {
		return new Promise((resolve) => {
			this.phone.call(request, (response) => {
				resolve(response);
			});
		}); 
	}

	static async createDataContext(name, attrs, callback) {
		await this.sendRequest({
			action: "delete",
			resource: `dataContext[${name}]`
		});

		const response = await this.sendRequest({
			action: "create",
			resource: "dataContext",
			values: {
				name: name,
				label: name,
				collections: [{ name: name, attrs: CODAPConnect.toAttrs(attrs)}]
			}
		});

		if (callback) callback();
		return response?.success === true;
	}

	static async removeDataContext(name) {
		if (!name || name === "default") return true;
		
		const response = await this.sendRequest({
			action: "delete",
			resource: `dataContext[${name}]`
		});

		return response?.success === true;
	}

	static async getDataContext(name) {
		const response = await this.sendRequest({
			action: "get",
			resource: `dataContext[${name}]`
		});
		return response;
	}

	static async dataContextExists(name) {
		const response = await CODAPConnect.getDataContext(name);
		return response?.success === true;
	}

	static async getCases(dataContext, collection = dataContext) {
		const exists = await CODAPConnect.dataContextExists(dataContext);
		if (!exists) return;

		const response = await this.sendRequest({
			action: "get",
			resource: `dataContext[${dataContext}].collection[${collection}].allCases`
		});
		return response;
	}

	static async createGlobal(name, value) {
		const response = await this.sendRequest({
			action: "create",
			resource: "global",
			values: {
				name: name,
				value: value
			}
		});
		return response;
	}

	static async updateGlobal(name, value) {
		if (!CODAPConnect.globalExists(name)) return;

		const response = await this.sendRequest({
			action: "update",
			resource: `global[${name}]`,
			values: {
				value: value
			}
		});
		if (!response.success) return;
		return response;
	}

	static async getGlobal(name) {
		const response = await this.sendRequest({
			action: "get",
			resource: `global[${name}]`
		});
		if (!response.success) return;
		return response.values["value"];
	}

	static async globalExists(name) {
		const response = await this.sendRequest({
			action: "get",
			resource: `global[${name}]`
		});
		return response.success;
	}

	static toAttrs(names, type = "nominal") {
    	return names.map(name => ({ name, type }));	
	}

}