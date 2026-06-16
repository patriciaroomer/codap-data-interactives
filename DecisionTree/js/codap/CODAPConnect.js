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

	static toAttrs(names, type = "nominal") {
    	return names.map(name => ({ name, type }));	
	}

	static async dataContextExists(name) {
		const response = await this.sendRequest({
			action: "get",
			resource: `dataContext[${name}]`
		});
		return response?.success === true;
	}
}