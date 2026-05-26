import App from "./App.js";
import CODAPConnect from "./codap/CODAPConnect.js";

const title = "Decision Tree";
const version = "v0.1";
const dimensions = { width: 750, height: 1050 };
const preventBringToFront = false;

async function createFrame() {
	await CODAPConnect.sendRequest({
			action: "update",
			resource: "interactiveFrame",
			values: {
					title,
					version,
					dimensions,
					preventBringToFront
			}
	});
}

async function main() {
	await CODAPConnect.sendRequest({ action: "get", resource: "document" });
	await createFrame();
	await new App().start();
}

main();