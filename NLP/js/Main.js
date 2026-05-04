import BagOfWords from './nlp/BagOfWords.js';
import CODAPConnect from './codap/CODAPConnect.js';
import TextPreprocesser from './nlp/TextPreprocesser.js';
import TextClassificator from './nlp/TextClassificator.js';
import CaseTable from './codap/CaseTable.js';
import Parser from './codap/Parser.js';

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

  const preprocessed = new TextPreprocesser(corpus).process();
  const bagOfWords = new BagOfWords(preprocessed);
  const categories = await new TextClassificator(preprocessed).classify();
  const parser = new Parser(corpus, preprocessed, categories);

  await CODAPConnect.createDataContext("Corpus", parser.attributes);
  console.log(parser.entries);
  await new CaseTable("Corpus", parser.entries).create();

  console.log(bagOfWords.attributes);
  console.log(bagOfWords.entries);

  await CODAPConnect.createDataContext("Bag of Words", bagOfWords.attributes);
  await new CaseTable("Bag of Words", bagOfWords.entries).create();
}

main();