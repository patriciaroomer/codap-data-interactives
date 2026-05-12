import CODAPConnect from './codap/CODAPConnect.js';

const title = "Clustering";
const version = "v0.1";
const dimensions = { width: 500, height: 600 };
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
}

main();