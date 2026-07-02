import Controller from './Controller.js';
import HuggingFaceImporter from './importers/HuggingFaceImporter.js';
import OECDImporter from './importers/OECDImporter.js';
import WorldBankImporter from './importers/WorldBankImporter.js';
import DataPublicImporter from './importers/DataPublicImporter.js';
import KaggleImporter from './importers/KaggleImporter.js';
import CODAPConnect from './codap/CODAPConnect.js';

const title = 'Dataset Importer';
const version = 'v0.1';
const dimensions = { width: 500, height: 330 };
const preventBringToFront = false;

async function createFrame() {
  await CODAPConnect.sendRequest({
    action: 'update',
    resource: 'interactiveFrame',
    values: {
      title,
      version,
      dimensions,
      preventBringToFront
    }
  });
}

async function createDefaultDataContext() {
  await CODAPConnect.sendRequest({
    action: "create",
    resource: "dataContext",
    values: {
      name: "default",
      label: "default"
    }
  });
}

async function main() {
  await CODAPConnect.sendRequest({ action: "get", resource: "document" });
  await createDefaultDataContext();
  await createFrame();
  new Controller();
}

main();