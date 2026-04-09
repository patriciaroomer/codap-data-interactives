import CODAPConnect from './CODAPConnect.js';
import CSVImporter from "./CSVImporter.js";
import HuggingFaceImporter from './HuggingFaceImporter.js';

const title = 'Import a dataset';
const version = 'v0.1';
const dimensions = { width: 500, height: 300 };
const preventBringToFront = false;

function createFrame(callback) {
  CODAPConnect.sendRequest({
    action: 'update',
    resource: 'interactiveFrame',
    values: {
      title: title,
      version: version,
      dimensions: dimensions,
      preventBringToFront: preventBringToFront
    }
  }, () => { if (callback) callback() });
}

function createDefaultDataContext(callback) {
  CODAPConnect.sendRequest({
    action: "create",
    resource: "dataContext",
    values: {
      name: "default",
      label: "default"
    }
  }, () => { if (callback) callback() });
}

function main() {
  new CODAPConnect();

  CODAPConnect.sendRequest({ action: "get", resource: "document" }, () => {

    createDefaultDataContext(() => {
      createFrame(() => {
        new CSVImporter();
        new HuggingFaceImporter();
      });
    })
  })
}

main();