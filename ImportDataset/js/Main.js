import CODAPConnect from './codap/CODAPConnect.js';
import Controller from './codap/Controller.js';
import HuggingFaceImporter from './importers/HuggingFaceImporter.js';
import OECDImporter from './importers/OECDImporter.js';
import WorldBankImporter from './importers/WorldBankImporter.js';
import DataPublicImporter from './importers/DataPublicImporter.js';
import KaggleImporter from './importers/KaggleImporter.js';

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
  testServer();

  new CODAPConnect();

  CODAPConnect.sendRequest({ action: "get", resource: "document" }, () => {

    createDefaultDataContext(() => {
      createFrame(() => {
        new Controller([
          new HuggingFaceImporter(),
          new KaggleImporter(),
          new OECDImporter(),
          new WorldBankImporter(),
          new DataPublicImporter()
        ]);
      });
    })
  })
}

async function testServer() {
  const response = await fetch("http://localhost:3000/api/hello");
  const data = await response.json();
  console.log(data.message);
}

main();