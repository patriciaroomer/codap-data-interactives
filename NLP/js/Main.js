import BagOfWords from './BagOfWords.js';
import CODAPConnect from './CODAPConnect.js';
import TextPreprocesser from './TextPreprocesser.js';

const title = "Natural Language Processing";
const version = "v0.1";
const dimensions = { width: 500, height: 500 };
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
  new CODAPConnect();
  await CODAPConnect.sendRequest({ action: "get", resource: "document" });
  await createDefaultDataContext();
  await createFrame();

  let corpus = [
        "I can't wait for the new season of my favorite show! 😍",
        "The COVID-19 pandemic has affected millions of people worldwide.",
        "U.S. stocks fell on Friday after news of rising inflation.",
        "<html><body>Welcome to the website!</body></html>",
        "JavaScript is a great programming language!!! ??",
        "Check out https://www.example.com for more info!",
        "He won 1st prize in the comp3tition!!!",
        "I luvvv this movie sooo much!!!"
  ]

  const preprocessed = new TextPreprocesser(corpus).process();
  console.log(preprocessed);
  const bagOfWords = new BagOfWords(preprocessed).count();
  console.log(bagOfWords);

  let i = 0;
  while (i < preprocessed.length) {
    const response = await fetch(`http://localhost:3000/api/nlp/classify?text=${encodeURIComponent(preprocessed[i])}`);
    const labels = await response.json();
    i++;
    console.log(labels);
  }
}

main();