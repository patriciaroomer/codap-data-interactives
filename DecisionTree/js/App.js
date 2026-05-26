import CODAPConnect from "./codap/CODAPConnect.js";
import Graphs from "./codap/Graphs.js";
import DecisionTree from "./decision-tree/DecisionTree.js";
import FeatureMapping from "./decision-tree/FeatureMapping.js";
import GameFormController from "./games/GameFormController.js";
import GameRepository from "./games/GameRepository.js";
import Logger from "./ui/Logger.js";
import TreeRenderer from "./ui/TreeRenderer.js";

export default class App {
  constructor() {
    this.logger   = new Logger();

    this.mapping  = new FeatureMapping();
    this.repo     = new GameRepository();
    this.tree     = new DecisionTree(this.mapping);

    this.renderer = new TreeRenderer(
      document.getElementById('treeSvg'),
      document.getElementById('treeInfo'),
      this.mapping
    );
    this.form     = new GameFormController(this.mapping, this.repo, this.logger);
    this.graphs   = new Graphs(this.mapping, this.logger);

    this.gameSelect = document.getElementById('gameSelect');
  }

  async start() {
    this.bindEvents();
    this.renderer.render();
    this.form.updateLabels();
    this.logger.log("Bereit. Klick auf 'Datensätze anlegen'.");
  }

  bindEvents() {
    this.on('btnSetup',          () => this.handleSetup());
    this.on('btnSample',         () => this.handleSample());
    this.on('btnApplyMapping',   () => this.handleApplyMapping());
    this.on('btnClassify',       () => this.handleClassify());
    this.on('btnGraphs',         () => this.graphs.createSmallGraphs());
    this.on('btnRefreshList',    () => this.refreshGameList());
    this.on('btnRefreshMapping', () => this.refreshMapping());
    this.on('btnAddOne',         () => this.handleAddGame());

    this.gameSelect.addEventListener('change', () => this.highlightSelected());
  }

  on(id, fn) {
    document.getElementById(id).addEventListener('click', async () => {
      try { await fn(); }
      catch (e) { this.logger.log(`Fehler (${id}):`, e); }
    });
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