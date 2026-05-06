import CODAPConnect from './codap/CODAPConnect.js';
import UIListener from './ui/UIListener.js';
import TextPreprocessingListener from './ui/TextPreprocessingListener.js';
import BagOfWordsListener from './ui/BagOfWordsListener.js';
import TextClassificationListener from './ui/TextClassificationListener.js';
import PromptListener from './ui/PromptListener.js';

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
  new UIListener();
  new PromptListener();
  new TextPreprocessingListener();
  new BagOfWordsListener();
  new TextClassificationListener();
}

main();