import CODAPConnect from "./codap/CODAPConnect.js";
import ID3 from "./decision-tree/ID3.js";
import CardController from "./ui/CardController.js";
import Logger from "./ui/Logger.js";
import TrainingData from "./data/TrainingData.js";
import TreeLayout from "./decision-tree/TreeLayout.js";
import TreeRenderer from "./decision-tree/TreeRenderer.js";
import Data from "./data/Data.js";
import TestingData from "./data/TestingData.js";
import CaseTable from "./codap/CaseTable.js";

export default class App {
  constructor() {
    this.trainingData = new TrainingData();
    this.testingData = new TestingData();

    this.tree = null;
    this.id3 = new ID3();

    this.renderer = new TreeRenderer(
      document.getElementById("treeSvg"),
      document.getElementById("treeInfo")
    );

    this.cardController = new CardController();

    // --- Interactive UI elements ---
    this.classInput = document.getElementById("className");
    this.classButton = document.getElementById("btnAddClass");
    this.attrInput = document.getElementById("attrName");
    this.attrButton = document.getElementById("btnAddAttr");
    this.lockButton = document.getElementById("btnLockParam");
    this.resetButton = document.getElementById("btnResetParam");
    this.trainingInput = document.getElementById("trainDataName");
    this.trainButton = document.getElementById("btnTrain");
    this.addTrainButton = document.getElementById("btnAddTrainData");
    this.testInput = document.getElementById("testDataName");
    this.testButton = document.getElementById("btnTest");
  }

  async start() {
    this.bindEvents();
    this.renderer.render();
  }

  bindEvents() {
    // Classes
    this.onEnter(this.classInput, () => this.handleClass());
    this.onEnter(this.classButton, () => this.handleClass());
    this.onClick(this.classButton, () => this.handleClass());
    
    // Attributes
    this.onEnter(this.attrInput, () => this.handleAttribute());
    this.onEnter(this.attrButton, () => this.handleAttribute());
    this.onClick(this.attrButton, () => this.handleAttribute());

    // Parameters
    this.onClick(this.lockButton, async () => await this.handleLockButton());
    this.onClick(this.resetButton, async () => await this.handleResetButton());
    
    // Training data
    this.onEnter(this.trainingInput, async () => await this.handleTrainingData());
    this.onClick(this.addTrainButton, async () => await this.handleTrainingData());

    // Training
    this.onClick(this.trainButton, () => this.handleTraining());

    // Testing
    this.onEnter(this.testInput, async () => await this.handleTesting());
    this.onClick(this.testButton, async () => await this.handleTesting());
  }

  onClick(el, fn) {
    el.addEventListener("click", async () => {
      try { await fn(); }
      catch (e) { console.log(e); }
    });
  }

  onEnter(el, fn) {
    el.addEventListener("keydown", async (event) => {
      if (event.keyCode !== 13) return;
      try { await fn(); }
      catch (e) { console.log(e); }
    });
  }

  handleClass() {
    this.trainingData.addClass();
    this.cardController.handleClassCard();
  }

  handleAttribute() {
    this.trainingData.addAttribute();
    this.testingData.addAttribute();
    this.cardController.handleAttributeCard();
  }

  async handleLockButton() {
    this.cardController.handleLockButton();
    await this.trainingData.parameters.persist();
  }

  async handleResetButton() {
    this.trainingData = new TrainingData();
    this.testingData = new TestingData();
    this.cardController.handleResetButton();
    await CaseTable.hideAll();
    this.resetTree();
  }

  async handleTrainingData() {
    this.trainingData.addData();
    this.cardController.handleTrainCard();

    await this.trainingData.persist();
  }

  handleTraining() {
    this.tree = this.id3.train(this.trainingData.data);
    ID3.assignIds(this.tree);
    this.renderer.render(this.tree);
    const testCard = document.getElementById("testCard");
    this.cardController.unlock(testCard);
  }
  
  async handleTesting() {
    this.testingData.addData();
    const data = this.testingData.getCurrentData();

    const { class: prediction, path } = this.id3.predict(this.tree, data);
    this.renderer.render(this.tree, path);
    this.cardController.handleTestCard();
    
    this.testingData.setPrediction(prediction);
    await this.testingData.persist();
  }

  resetTree() {
    this.renderer.render(null);
    const tree = document.getElementById("treeSvg");
    tree.viewBox.baseVal.width = 920;
    tree.viewBox.baseVal.height = 320;
    tree.viewBox.animVal.width = 920;
    tree.viewBox.animVal.height = 320;
  }

}