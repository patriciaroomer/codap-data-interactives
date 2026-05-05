import BagOfWords from './nlp/BagOfWords.js';
import CODAPConnect from './codap/CODAPConnect.js';
import TextPreprocesser from './nlp/TextPreprocesser.js';
import TextClassificator from './nlp/TextClassificator.js';
import CaseTable from './codap/CaseTable.js';
import Parser from './codap/Parser.js';
import Listener from './Listener.js';

const title = "Natural Language Processing";
const version = "v0.1";
const dimensions = { width: 500, height: 500 };
const preventBringToFront = false;

const corpus =
  [
    "I can't wait for the new season of my favorite show! 😍",
    "The COVID-19 pandemic has affected millions of people worldwide.",
    "U.S. stocks fell on Friday after news of rising inflation.",
    "<html><body>Welcome to the website!</body></html>",
    "JavaScript is a great programming language!!! ??",
    "Check out https://www.example.com for more info!",
    "He won 1st prize in the comp3tition!!!",
    "I luvvv this movie sooo much!!!"
  ]

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

  /*
  const preprocessed = new TextPreprocesser(corpus).process();
  const bagOfWords = new BagOfWords(preprocessed);
  const classificator = await new TextClassificator(preprocessed);
  await classificator.classify();
  const parser = new Parser(corpus, preprocessed);

  await CODAPConnect.createDataContext("Text Preprocessing", parser.attributes);
  await new CaseTable("Text Preprocessing", parser.entries).create();

  await CODAPConnect.createDataContext("Bag of Words", bagOfWords.attributes);
  await new CaseTable("Bag of Words", bagOfWords.entries).create();

  console.log(classificator.attributes);
  console.log(classificator.entries);

  await CODAPConnect.createDataContext("Text Classification", classificator.attributes);
  await new CaseTable("Text Classification", classificator.entries).create();
  */
  }

main();