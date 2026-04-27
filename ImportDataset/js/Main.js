import CODAPConnect from './codap/CODAPConnect.js';
import Controller from './codap/Controller.js';
import HuggingFaceImporter from './importers/HuggingFaceImporter.js';
import OECDImporter from './importers/OECDImporter.js';
import WorldBankImporter from './importers/WorldBankImporter.js';
import DataPublicImporter from './importers/DataPublicImporter.js';
import KaggleImporter from './importers/KaggleImporter.js';

const title = 'Dataset Importer';
const version = 'v0.1';
const dimensions = { width: 370, height: 290 };
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
  testServer();

  new CODAPConnect();

  await CODAPConnect.sendRequest({ action: "get", resource: "document" });

  await createDefaultDataContext();
  await createFrame();

  new Controller([
    new HuggingFaceImporter(),
    new KaggleImporter(),
    new OECDImporter(),
    new WorldBankImporter(),
    new DataPublicImporter()
  ]);
}

async function testServer() {
  const response = await fetch("http://localhost:3000/api/hello");
  const data = await response.json();
  console.log(data.message);
}

main();