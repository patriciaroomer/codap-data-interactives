import App from "./App.js";
import CODAPConnect from "./codap/CODAPConnect.js";

const title = "Recommender System";
const version = "v0.1";
const dimensions = { width: 1000, height: 1100};
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
	new App().start();
}

main();