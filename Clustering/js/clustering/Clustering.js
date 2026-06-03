import CaseTable from '../codap/CaseTable.js';
import CODAPConnect from '../codap/CODAPConnect.js';
import Slider from '../codap/Slider.js';
import ControlPanel from '../ui/ControlPanel.js';
import GraphDrawer from '../ui/GraphDrawer.js';
import State from '../ui/State.js';
import Randomizer from './Randomizer.js';

export default class Clustering {

  constructor() {
    this.snapshots = new Map();
    this.graph = new GraphDrawer();
    this.iteration = 0;
  }

  // generateData()
  initialize() {
    this.snapshots.clear();

    State.k = Math.max(2, Math.min(10, parseInt(ControlPanel.k.value, 10) || 3));
    State.n = Math.max(5, Math.min(400, parseInt(ControlPanel.n.value, 10) || 60));
    State.maxIter = Math.max(0, Math.min(200, parseInt(ControlPanel.maxIterations.value, 10) || 25));
    State.showLines = !!ControlPanel.toggleLines.checked;

    console.log("Setting random points");
    const randomizer = new Randomizer().generate();
    State.points = Array.from({ length: State.n }, () => ({ x: randomizer() * 2 - 1 , y: randomizer() * 2 - 1}));

    this.initializeCentroids(randomizer);

    State.startCentroids = this.cloneCentroids(State.centroids);
    State.targetCentroids = this.cloneCentroids(State.centroids);
    State.labels = new Array(State.n).fill(-1);
    State.prevLabelsforBlink = new Array(State.n).fill(-1);
    State.changed = new Array(State.n).fill(false);
    State.blinking = false;
    State.iteration = 0;
    State.phase = "—";
    State.running = false;
    State.converged = false;

    ControlPanel.msg.textContent = "";
    this.graph.draw();
    ControlPanel.update();

    this.initializeFirstGeneration();
  }

  initializeCentroids(randomizer) {
    const chosen = new Set();
    State.centroids = [];

    while (State.centroids.length < State.k) {
      const idx = Math.floor(randomizer() * State.n);
      if (chosen.has(idx)) continue;
      chosen.add(idx);
      State.centroids.push({ x: State.points[idx].x, y: State.points[idx].y });
    }
  }

  // prepareIteration1Snapshot()
  initializeFirstGeneration() {
    const previousLabels = State.labels.slice();
    State.prevLabelsforBlink = previousLabels;
    this.setLabels(previousLabels);

    this.snapshots.set(0, {
      points: this.clonePoints(State.points),
      labels: this.cloneLabels(State.labels),
      centroids: this.cloneCentroids(State.centroids)
    });
    Slider.clustering = this;

    State.blinking = true;

    this.graph.draw();
    setTimeout(() => {
      State.blinking = false;
      State.changed.fill(false);
      this.graph.draw();
    });
  }

  async run() {
    while (State.running && !State.converged) {
      await this.step();
      await new Promise(r => setTimeout(r, 120));
    }
  }

  async step() {
    if (State.converged) return;
    if (State.iteration >= State.maxIter) {
      await this.end();
      return;
    }

    State.phase = "Assign";
    const previousLabels = State.labels.slice();
    State.prevLabelsforBlink = previousLabels;
    this.setLabels(previousLabels);

    State.blinking = true;
    this.graph.draw();
    ControlPanel.update();
    await new Promise(r => setTimeout(r, State.blinkMs));
    State.blinking = false;
    State.changed.fill(false);
    this.graph.draw();
    await new Promise(r => setTimeout(r, Math.max(0, State.phaseMsAssign - State.blinkMs)));

    State.iteration++;

    await Slider.setSliderValue(State.iteration);
    
    this.snapshots.set(State.iteration, {
      points: this.clonePoints(State.points),
      labels: this.cloneLabels(State.labels),
      centroids: this.cloneCentroids(State.centroids)
    });
    Slider.clustering = this;

    await CaseTable.showIteration(State.iteration, this.snapshots.get(State.iteration));

    State.phase = "Update";
    this.computeTargets();
    ControlPanel.update();
    await this.moveCentroidsSmooth();

    const newLabels = State.labels.slice();
    this.setLabels(newLabels);

    if (this.labelsEqual(previousLabels, State.labels)) {
      State.converged = true;
      State.running = false;
      State.phase = "Done";
    } else {
      State.phase = "—";
    }

    this.graph.draw();
    ControlPanel.update();
  }

  async end() {
    State.running = false;
    State.phase = "Max iterations reached";
    this.graph.draw();
    ControlPanel.update();
    return;
  }

  setLabels(previousLabels) {

    const points = State.points;
    const centroids = State.centroids;
    const labels = State.labels;
    const changed = State.changed;

    for (let i=0; i < points.length; i++) {
      const point = points[i];

      let bestJ = 0;
      let bestD = Infinity;

      for (let j = 0; j < centroids.length; j++){
        const centroid = centroids[j];
        const dx = point.x - centroid.x;
        const dy = point.y - centroid.y;
        const d2 = dx*dx + dy*dy;
        if (d2 < bestD) { bestD = d2; bestJ = j; }
      }
      labels[i] = bestJ;
      changed[i] = bestJ !== previousLabels[i];
    }

    State.labels = labels;
    State.changed = changed;
  }

  computeTargets() {
    const k = State.k;
    const sumX = new Array(k).fill(0);
    const sumY = new Array(k).fill(0);
    const count  = new Array(k).fill(0);

    for (let i=0; i < State.points.length;i++){
      const j = State.labels[i];
      sumX[j] += State.points[i].x;
      sumY[j] += State.points[i].y;
      count[j] += 1;
    }

    for (let j=0;j<k;j++){
      if (count[j] > 0) {
        State.targetCentroids[j].x = sumX[j] / count[j];
        State.targetCentroids[j].y = sumY[j] / count[j];
      } else {
        const idx = Math.floor(Math.random() * State.points.length);
        State.targetCentroids[j].x = State.points[idx].x;
        State.targetCentroids[j].y = State.points[idx].y;
      }
    }
  }

  async moveCentroidsSmooth() {
    const steps = State.moveSteps;
    const start = this.cloneCentroids(State.centroids);
    const target = this.cloneCentroids(State.targetCentroids);

    for (let i = 1; i <= steps; i++) {
      const alpha = i / steps;
      for (let j = 0; j < State.centroids.length; j++) {
        State.centroids[j].x = start[j].x + (target[j].x - start[j].x) * alpha;
        State.centroids[j].y = start[j].y + (target[j].y - start[j].y) * alpha;
      }
      this.graph.draw();
      await new Promise(r => {
        requestAnimationFrame(() => {
          setTimeout(r, State.phaseMsMove / steps);
        });
      });
    }
  }

  clonePoints(points) {
    return points.map(p => ({ x: p.x, y: p.y }));
  }

  cloneCentroids(centroids) {
    return centroids.map(c => ({ x: c.x, y: c.y}));
  }

  cloneLabels(labels) {
    return labels.slice();
  }

  labelsEqual(a, b) {
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  showIteration(iteration) {
    const snapshot = this.snapshots.get(iteration);
    if (!snapshot) return;

    State.labels = snapshot.labels.slice();
    State.centroids = this.cloneCentroids(snapshot.centroids);
    this.graph.draw();
  }
}