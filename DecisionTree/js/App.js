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
import State from "./codap/State.js";

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
    this.resetButton = document.getElementById("btnReset");
    this.classInput = document.getElementById("className");
    this.classButton = document.getElementById("btnAddClass");
    this.attrInput = document.getElementById("attrName");
    this.attrButton = document.getElementById("btnAddAttr");
    this.lockButton = document.getElementById("btnLockParam");
    this.trainingInput = document.getElementById("trainDataName");
    this.trainButton = document.getElementById("btnTrain");
    this.addTrainButton = document.getElementById("btnAddTrainData");
    this.resetTrainButton = document.getElementById("btnResetTrainData");
    this.testInput = document.getElementById("testDataName");
    this.testButton = document.getElementById("btnTest");

    this.trainCard = document.getElementById("trainCard");
    this.testCard = document.getElementById("testCard");

    this.reloadState();
  }

  async start() {
    this.bindEvents();
    this.renderer.render();
  }

  async reloadState() {
    const classes = State.classes;
    if (classes) {
      for (const c of classes) {
        this.trainingData.addClass(c);
      }
    }

    const attributes = State.attributes;
    if (attributes) {
      for (const a of attributes) {
        this.trainingData.addAttribute(a);
        this.testingData.addAttribute(a);
      }
    }

    const trainingData = State.trainingData;
    if (trainingData) {
      for (const d of trainingData) {
        this.trainingData.data.push(d);
      }
    }

    const testingData = State.testingData;
    if (testingData) {
      for (const d of testingData) {
        this.testingData.data.push(d);
      }
    }

    const trained = await CODAPConnect.getGlobal("TRAINED");
    if (trained === 1) {
      await this.handleTraining();
    }

    this.cardController.reload();
  }

  bindEvents() {
    this.onClick(this.resetButton, async () => await this.handleResetButton());
    
    // Parameters
    this.onEnter(this.classInput, () => this.handleClass());
    this.onEnter(this.classButton, () => this.handleClass());
    this.onClick(this.classButton, () => this.handleClass());
    this.onEnter(this.attrInput, () => this.handleAttribute());
    this.onEnter(this.attrButton, () => this.handleAttribute());
    this.onClick(this.attrButton, () => this.handleAttribute());
    this.onClick(this.lockButton, async () => await this.handleLockButton());
    
    // Training
    this.onEnter(this.trainingInput, async () => await this.handleTrainingData());
    this.onClick(this.addTrainButton, async () => await this.handleTrainingData());
    this.onClick(this.trainButton, async () => await this.handleTraining());
    this.onClick(this.resetTrainButton, async () => await this.handleTrainingReset());

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

  async handleResetButton() {
    this.trainingData = new TrainingData();
    this.testingData = new TestingData();
    this.cardController.handleResetButton();
    await CaseTable.hideAll();
    this.resetTree();
  }

  handleClass() {
    const input = this.getClassInput();
    this.trainingData.addClass(input);
    this.cardController.handleClassCard();
  }

  handleAttribute() {
    const input = this.getAttrInput();
    this.trainingData.addAttribute(input);
    this.testingData.addAttribute(input);
    this.cardController.handleAttributeCard();
  }

  async handleLockButton() {
    this.cardController.handleLockButton();
    await this.trainingData.parameters.persist();
  }

  async handleTrainingData() {
    this.trainingData.addData(this.getDataInput(this.trainCard));
    this.cardController.handleTrainCard();

    await this.trainingData.persist();
  }

  async handleTrainingReset() {
    this.trainingData.data = [];
    this.cardController.handleTrainingReset();
    await CaseTable.hide("Training data");
    this.resetTree();
  }

  async handleTraining() {
    this.tree = this.id3.train(this.trainingData.data);
    ID3.assignIds(this.tree);
    this.renderer.render(this.tree);
    const testCard = document.getElementById("testCard");
    this.cardController.unlock(testCard);
    await CODAPConnect.updateGlobal("TRAINED", 1);
  }
  
  async handleTesting() {
    this.testingData.addData(this.getDataInput(this.testCard));
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

  getClassInput() {
    return document.getElementById("className").value;
  }

  getAttrInput() {
    return document.getElementById("attrName").value;
  }

  getDataInput(card) {
    return card.querySelector(".dataName").value;
  }

}