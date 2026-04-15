import CODAPConnect from './codap/CODAPConnect.js';
import HuggingFaceImporter from './importers/HuggingFaceImporter.js';
import OECDImporter from './importers/OECDImporter.js';
import WorldBankImporter from './importers/WorldBankImporter.js';
import DataPublicImporter from './importers/DataPublicImporter.js';

const title = 'Import a dataset';
const version = 'v0.1';
const dimensions = { width: 500, height: 500 };
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
        new HuggingFaceImporter();
        new OECDImporter();
        new WorldBankImporter();
        new DataPublicImporter();
      });
    })
  })
}

main();