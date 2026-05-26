import Clustering from '../clustering/Clustering.js';
import CODAPConnect from '../codap/CODAPConnect.js';
import State from './State.js';

export default class ControlPanel {
  static k = null;
  static n = null;
  static seed = null;
  static maxIterations = null;
  static toggleLines = null;
  static resetButton = null;
  static startButton = null;
  static pauseButton = null;
  static stepButton = null;
  static restartButton = null;
  static iteration = null;
  static phase = null;
  static converged = null;
  static codapStatus = null;
  static msg = null;

  static sliderIteration = 1;
  static clustering = null;
  static graph = null;

  static init(graph) {
    ControlPanel.graph = graph;

    ControlPanel.k             = document.getElementById("k");
    ControlPanel.n             = document.getElementById("n");
    ControlPanel.seed          = document.getElementById("seed");
    ControlPanel.maxIterations = document.getElementById("maxIter");
    ControlPanel.toggleLines   = document.getElementById("toggleLines");
    ControlPanel.resetButton   = document.getElementById("btnReset");
    ControlPanel.startButton   = document.getElementById("btnStart");
    ControlPanel.pauseButton   = document.getElementById("btnPause");
    ControlPanel.stepButton    = document.getElementById("btnStep");
    ControlPanel.restartButton = document.getElementById("btnRestart");
    ControlPanel.iteration     = document.getElementById("iter");
    ControlPanel.phase         = document.getElementById("phase");
    ControlPanel.converged     = document.getElementById("conv");
    ControlPanel.codapStatus   = document.getElementById("codapStatus");
    ControlPanel.msg           = document.getElementById("msg");

    ControlPanel.addResetListener();
    ControlPanel.addStartListener();
    ControlPanel.addPauseListener();
    ControlPanel.addStepListener();
    ControlPanel.addRestartListener();
    ControlPanel.addToggleLinesListener();
  }

  static update() {
    ControlPanel.iteration.textContent = String(State.iteration);
    ControlPanel.phase.textContent = State.phase;
    ControlPanel.converged.textContent = State.converged ? "Yes" : "No";
  }

  static addResetListener() {
    ControlPanel.resetButton.addEventListener("click", async () => {
      ControlPanel.clustering = new Clustering();
      ControlPanel.clustering.initialize();
      ControlPanel.sliderIteration = 1;
      document.getElementById("shownIter").textContent = "1";
      await CODAPConnect.showIteration(1, ControlPanel.clustering.snapshots.get(1));
    });
  }

  static addStartListener() {
    ControlPanel.startButton.addEventListener("click", async () => {
      if (State.converged || State.running) return;
      State.maxIter = Math.max(1, Math.min(200, parseInt(ControlPanel.maxIterations.value, 10) || 25));
      State.showLines = !!ControlPanel.toggleLines.checked;
      State.running = true;
      ControlPanel.clustering = new Clustering();
      await ControlPanel.clustering.run();
    });
  }

  static addPauseListener() {
    ControlPanel.pauseButton.addEventListener("click", () => {
      State.running = false;
    });
  }

  static addStepListener() {
    ControlPanel.stepButton.addEventListener("click", async () => {
      if (State.running) return;
      State.maxIter = Math.max(1, Math.min(200, parseInt(ControlPanel.maxIterations.value, 10) || 25));
      State.showLines = !!ControlPanel.toggleLines.checked;
      if (!ControlPanel.clustering) ControlPanel.clustering = new Clustering();
      await ControlPanel.clustering.step();
    });
  }

  static addRestartListener() {
    ControlPanel.restartButton.addEventListener("click", async () => {
      if (!ControlPanel.clustering) return;
      State.running = false;
      State.converged = false;
      State.iteration = 0;
      State.phase = "—";
      State.centroids = ControlPanel.clustering.cloneCentroids(State.startCentroids);
      State.targetCentroids = ControlPanel.clustering.cloneCentroids(State.startCentroids);
      State.labels.fill(-1);
      State.prevLabelsforBlink.fill(-1);
      State.changed.fill(false);
      State.blinking = false;
      ControlPanel.clustering.snapshots.clear();
      ControlPanel.clustering.initializeFirstGeneration();
      ControlPanel.graph.draw();
      ControlPanel.update();
      ControlPanel.sliderIteration = 1;
      document.getElementById("shownIter").textContent = "1";
      await CODAPConnect.showIteration(1, ControlPanel.clustering.snapshots.get(1));
    });
  }

  static addToggleLinesListener() {
    ControlPanel.toggleLines.addEventListener("change", () => {
      State.showLines = !!ControlPanel.toggleLines.checked;
      ControlPanel.graph.draw();
    });
  }
}