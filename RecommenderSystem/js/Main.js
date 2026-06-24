import CODAPConnect from "./codap/CODAPConnect.js";
import CSVParser from "./csv/CSVParser.js";

const title = "Recommender System";
const version = "v0.1";
const dimensions = { width: 1000, height: 750 };
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

	const response = await fetch("../RecommenderSystem/example.csv");
	const file = await response.text();
	const parser = new CSVParser();
	await parser.parse(file, true);
	console.log(parser.data);
}

main();