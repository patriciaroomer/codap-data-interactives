import Clustering from '../clustering/Clustering.js';
import CODAPConnect from '../codap/CODAPConnect.js';
import GraphDrawer from './GraphDrawer.js';
import State from './State.js';

export default class ControlPanel {

  static k = document.getElementById("k");
  static n = document.getElementById("n");
  static seed = document.getElementById("seed");
  static maxIterations = document.getElementById("maxIter");
  static toggleLines = document.getElementById("toggleLines");

  static resetButton = document.getElementById("btnReset");
  static startButton = document.getElementById("btnStart");
  static pauseButton = document.getElementById("btnPause");
  static stepButton = document.getElementById("btnStep");
  static restartButton = document.getElementById("btnRestart");

  static iteration = document.getElementById("iter");
  static phase = document.getElementById("phase");
  static converged = document.getElementById("conv");
  static codapStatus = document.getElementById("codapStatus");
  static msg = document.getElementById("msg");

  static sliderIteration = 1;
  static clustering;

  static {
    ControlPanel.addResetListener();
    ControlPanel.addStartListener();
    ControlPanel.addPauseListener();
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
      this.clustering = new Clustering();
      this.clustering.initialize();

      ControlPanel.sliderIteration = 1;
      document.getElementById("shownIter").textContent = "1";
      await CODAPConnect.showIteration(1);
    });
  }

  static addStartListener() {
    ControlPanel.startButton.addEventListener("click", async () => {
      if (State.converged || State.running) return;

      State.maxIter = Math.max(1, Math.min(200, parseInt(ControlPanel.maxIterations.ariaValueMax, 10) || 25));
      State.showLines = !!ControlPanel.toggleLines.checked;

      this.clustering = new Clustering();
      await this.clustering.run();
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

      if (!this.clustering) this.clustering = new Clustering();
      await this.clustering.step();
    });
  }

  static addRestartListener() {
    ControlPanel.restartButton.addEventListener("click", async () => {
      if (!this.clustering) return;

      State.running = false;
      State.converged = false;
      State.iteration = 0;
      State.phase = "—";
      State.centroids = this.clustering.cloneCentroids(State.startCentroids);
      State.targetCentroids = this.clustering.cloneCentroids(State.startCentroids);
      State.labels.fill(-1);
      State.prevLabelsforBlink.fill(-1);
      State.changed.fill(false);
      State.blinking = false;

      this.clustering.snapshots.clear();
      this.clustering.initializeFirstGeneration();

      new GraphDrawer().draw();
      ControlPanel.update();

      this.sliderIteration = 1;
      document.getElementById("shownIter").textContent = "1";
      await CODAPConnect.showIteration(1);
    });
  }

  static addToggleLinesListener() {
    ControlPanel.toggleLines.addEventListener("change", () => {
      State.showLines = !!ControlPanel.toggleLines.checked;
      new GraphDrawer().draw();
    });
  }
}
