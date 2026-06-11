import CODAPConnect from "./codap/CODAPConnect.js";
import Graphs from "./codap/Graphs.js";
import DecisionTree from "./decision-tree/DecisionTree.js";
import FeatureMapping from "./decision-tree/FeatureMapping.js";
import ID3 from "./decision-tree/ID3.js";
import CardController from "./ui/CardController.js";
import Logger from "./ui/Logger.js";
import TrainingData from "./ui/TrainingData.js";
import TreeLayout from "./decision-tree/TreeLayout.js";
import TreeRenderer from "./ui/TreeRenderer.js";
import Data from "./ui/Data.js";
import TestData from "./ui/TestData.js";

export default class App {
  constructor() {
    this.logger   = new Logger();

    this.trainingData = new TrainingData();
    this.testingData = new TestData();

    this.mapping  = new FeatureMapping();
    //this.tree     = new DecisionTree(this.mapping);
    this.tree = null;
    this.id3      = new ID3();

    this.renderer = new TreeRenderer(
      document.getElementById('treeSvg'),
      document.getElementById('treeInfo'),
      this.mapping
    );

    this.cardController = new CardController();
    this.graphs   = new Graphs(this.mapping, this.logger);

    // --- UI elements ---
    this.classInput = document.getElementById("className");
    this.classButton = document.getElementById("btnAddClass");

    this.attrInput = document.getElementById("attrName");
    this.attrButton = document.getElementById("btnAddAttr");

    this.trainingInput = document.getElementById("trainDataName");
    this.trainButton = document.getElementById("btnTrain");
    this.addTrainButton = document.getElementById("btnAddTrainData");

    this.testInput = document.getElementById("testDataName");
    this.testButton = document.getElementById("btnTest");
  }

  async start() {
    this.bindEvents();
    this.renderer.render();
    //this.form.updateLabels();
    this.logger.log("Bereit. Klick auf 'Datensätze anlegen'.");
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
    
    // Training data
    this.onEnter(this.trainingInput, () => this.handleTrainingData());
    this.onEnter(this.addTrainButton, () => this.handleTrainingData());
    this.onClick(this.addTrainButton, () => this.handleTrainingData());

    // Training
    this.onEnter(this.trainButton, () => this.handleTraining());
    this.onClick(this.trainButton, () => this.handleTraining());

    // Testing
    this.onEnter(this.testInput, () => this.handleTesting());
    this.onEnter(this.testButton, () => this.handleTesting());
    this.onClick(this.testButton, () => this.handleTesting());
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

  handleTrainingData() {
    this.trainingData.addData();
    this.cardController.handleTrainCard();
  }

  handleTraining() {
    this.tree = this.id3.train(this.trainingData.data);
    this.renderer.render(this.tree);
    const testCard = document.getElementById("testCard");
    this.cardController.unlock(testCard);
  }
  
  handleTesting() {
    this.testingData.addData();
    const data = this.testingData.getCurrentData();
    const prediction = this.id3.predict(this.tree, data);
    console.log(prediction);
    this.cardController.handleTestCard();
  }

  async handleSetup() {
    await CODAPConnect.sendRequest({ 
			action: "create", 
			resource: "dataContext", 
			values: GameRepository.SCHEMA 
		});
    this.logger.log('DataContext Spiele erstellt/gefunden.');

    await CODAPConnect.sendRequest({ 
			action: "create", 
			resource: "dataContext", 
			values: FeatureMapping.SCHEMA 
		});
    this.logger.log('DataContext Merkmale erstellt/gefunden.');

		await CODAPConnect.sendRequest({ 
			action: "create", 
			resource: `dataContext[${FeatureMapping.DC_NAME}].item`, 
			values: FeatureMapping.SAMPLE_ITEMS 
		});

    await this.refreshMapping();
    await this.refreshGameList();
    this.renderer.render();
  }

  async handleSample() {
    const r1 = await CODAPConnect.sendRequest({ 
			action: "create", 
			resource: `dataContext[${FeatureMapping.DCNAME}].item`, 
			values: FeatureMapping.SAMPLEITEMS
    });
    this.logger.log('Beispieldaten Merkmale geschrieben:', r1.values ?? { ok: true });

    const r2 = await this.repo.insert(GameRepository.SAMPLE_ITEMS);
    this.logger.log('Beispieldaten Spiele geschrieben:', r2.values ?? { ok: true });

    await this.refreshMapping();
    await this.mapping.applyTitlesToGameContext(
      this.codap,
      GameRepository.DCNAME,
      GameRepository.COLLNAME
    );
    await this.refreshGameList();
    this.renderer.render();
  }

  async handleApplyMapping() {
    await this.refreshMapping();
    await this.mapping.applyTitlesToGameContext(
      this.codap,
      GameRepository.DCNAME,
      GameRepository.COLLNAME
    );
    this.logger.log('Mapping aktualisiert. (Falls Graphs schon existieren: ggf. neu erstellen.)');
  }

  async handleClassify() {
    const items = await this.repo.findAll();
    if (!items.length) {
      this.logger.log('Keine Spiele gefunden. Schreib erst Daten (oder nutze Beispieldaten).');
      return;
    }

    const updates = items.map((it) => {
      const { pred, regel } = this.tree.predict(it.values ?? {});
      return { id: it.id, values: { Vorhersage: pred, Regel: regel } };
    });

    const resp = await this.repo.updateMany(updates);
    this.logger.log(`Klassifiziert: ${updates.length} Spiele`, resp.values ?? { ok: true });

    await this.highlightSelected();
  }

  async handleAddGame() {
    await this.form.submit();
    await this.refreshGameList();
  }

  async refreshMapping() {
    try {
      await this.mapping.load(this.codap);
      this.logger.log('Merkmals-Mapping geladen:', this.mapping.getAll());
      this.form.updateLabels();
      this.renderer.render();
    } catch (e) {
      this.logger.log('Konnte Merkmale nicht laden (existiert die Tabelle?):', e);
    }
  }

  async refreshGameList() {
    this.gameSelect.innerHTML = '<option value="">—</option>';
    const items = await this.repo.findAll();
    for (const it of items) {
      const opt = document.createElement('option');
      opt.value       = String(it.id);
      opt.textContent = it.values?.Name ?? `(id ${it.id})`;
      this.gameSelect.appendChild(opt);
    }
    this.logger.log(`Spieleliste aktualisiert: ${items.length} Einträge`);
  }

  async highlightSelected() {
    const id = this.gameSelect.value;
    if (!id) { this.renderer.render(); return; }

    const found = await this.repo.findById(id);
    if (!found) { this.renderer.render(); return; }

    const { edges, leaf } = this.tree.tracePath(found.values ?? {});
    this.renderer.render(edges, leaf);
    this.logger.log('Pfad markiert für:', found.values?.Name ?? id, { edges, leaf });
  }
}