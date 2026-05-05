import BagOfWords from './nlp/BagOfWords.js';
import CODAPConnect from './codap/CODAPConnect.js';
import TextPreprocesser from './nlp/TextPreprocesser.js';
import TextClassificator from './nlp/TextClassificator.js';
import CaseTable from './codap/CaseTable.js';
import Listener from './ui/Listener.js';

const title = "Natural Language Processing";
const version = "v0.1";
const dimensions = { width: 500, height: 610 };
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
  new Listener();
}

main();