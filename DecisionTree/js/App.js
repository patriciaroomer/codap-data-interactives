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
import UI from "./constants/UI.js";

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
    this.reloadState();
  }

  async start() {
    this.bindEvents();
    this.renderer.render();
  }

  async reloadState() {
    
    // Reload classes from dataContext
    const classes = State.classes;
    if (classes) {
      for (const c of classes) {
        this.trainingData.addClass(c);
      }
    }

    // Reload attributes from dataContext
    const attributes = State.attributes;
    if (attributes) {
      for (const a of attributes) {
        this.trainingData.addAttribute(a);
        this.testingData.addAttribute(a);
      }
    }

    // Reload training data from dataContext
    const trainingData = State.trainingData;
    if (trainingData) {
      for (const d of trainingData) {
        this.trainingData.data.push(d);
      }
    }

    // Reload testing data from dataContext
    const testingData = State.testingData;
    if (testingData) {
      for (const d of testingData) {
        this.testingData.data.push(d);
      }
    }

    // Render tree if it was trained in the previous save.
    // For this, we store a CODAP global value,
    // 1 meaning the tree was trained and should be rendered again,
    // 0 meaning the tree was not trained yet.
    const trained = await CODAPConnect.getGlobal("TRAINED");
    if (trained === 1) {
      await this.handleTraining();
    }

    // Lock/unlock cards
    this.cardController.reload();
  }

  bindEvents() {
    this.onClick(UI.RESET_BUTTON, async () => await this.handleResetButton());
    
    // Parameters
    this.onEnter(UI.CLASS_INPUT, () => this.handleClass());
    this.onEnter(UI.CLASS_BUTTON, () => this.handleClass());
    this.onClick(UI.CLASS_BUTTON, () => this.handleClass());
    this.onEnter(UI.ATTR_INPUT, () => this.handleAttribute());
    this.onEnter(UI.ATTR_BUTTON, () => this.handleAttribute());
    this.onClick(UI.ATTR_BUTTON, () => this.handleAttribute());
    this.onClick(UI.LOCK_BUTTON, async () => await this.handleLockButton());
    
    // Training
    this.onEnter(UI.TRAIN_INPUT, async () => await this.handleTrainingData());
    this.onClick(UI.ADD_TRAIN_BUTTON, async () => await this.handleTrainingData());
    this.onClick(UI.TRAIN_BUTTON, async () => await this.handleTraining());
    this.onClick(UI.RESET_TRAIN_BUTTON, async () => await this.handleTrainingReset());

    // Testing
    this.onEnter(UI.TEST_INPUT, async () => await this.handleTesting());
    this.onClick(UI.TEST_BUTTON, async () => await this.handleTesting());
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
    this.trainingData.addData(this.getDataInput(UI.TRAIN_CARD));
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
    this.cardController.handleTraining();
    await CODAPConnect.updateGlobal("TRAINED", 1);
  }
  
  async handleTesting() {
    this.testingData.addData(this.getDataInput(UI.TEST_CARD));
    const data = this.testingData.getCurrentData();

    const { class: prediction, path } = this.id3.predict(this.tree, data);
    this.renderer.render(this.tree, path);
    this.cardController.handleTestCard();
    
    this.testingData.setPrediction(prediction);
    await this.testingData.persist();
  }

  resetTree() {
    this.renderer.render(null);
    UI.TREE.viewBox.baseVal.width = UI.TREE_WIDTH;
    UI.TREE.viewBox.animVal.width = UI.TREE_WIDTH;
    UI.TREE.viewBox.baseVal.height = UI.TREE_HEIGHT;
    UI.TREE.viewBox.animVal.height = UI.TREE_HEIGHT;
  }

  getClassInput() {
    return UI.CLASS_INPUT.value;
  }

  getAttrInput() {
    return UI.ATTR_INPUT.value;
  }

  getDataInput(card) {
    return card.getElementsByTagName("input")[0].value;
  }
}