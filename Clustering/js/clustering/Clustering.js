import CODAPConnect from '../codap/CODAPConnect.js';
import ControlPanel from '../ui/ControlPanel.js';
import GraphDrawer from '../ui/GraphDrawer.js';
import State from '../ui/State.js';
import Randomizer from './Randomizer.js';

export default class Clustering {

  constructor() {
    this.snapshots = new Map();
  }

  // generateData()
  initialize() {
    this.snapshots.clear();
    this.initializeCentroids();
    const randomizer = new Randomizer().generate();

    State.k = Math.max(2, Math.min(10, parseInt(ControlPanel.k.value, 10) || 3));
    State.showLines = !!ControlPanel.toggleLines.checked;
    State.points = Array.from({ length: n }, () => ({ x: randomizer() * 2 - 1 , y: randomizer() * 2 - 1}));
    State.maxIter = Math.max(1, Math.min(200, parseInt(ControlPanel.maxIterations.value, 10) || 25));
    State.startCentroids = this.cloneCentroids(State.centroids);
    State.targetCentroids = this.cloneCentroids(State.centroids);
    State.labels = new Array(n).fill(-1);
    State.prevLabelsforBlink = new Array(n).fill(-1);
    State.changed = new Array(n).fill(false);
    State.blinking = false;
    State.iteration = 0;
    State.phase = "—";
    State.running = false;
    State.converged = false;

    ControlPanel.msg.textContent = "";
    new GraphDrawer().draw();
    ControlPanel.update();

    this.initializeFirstGeneration();
  }

  initializeCentroids() {
    const chosen = new Set();
    State.centroids = [];
    while (State.centroids.length < k) {
      const idx = Math.floor(random() * 2);
      if (chosen.has(idx)) continue;
      chosen.add(idx);
      State.centroids.push({ x: State.points[idx].x, y: State.points[idx].y });
    }
  }

  // prepareIteration1Snapshot()
  initializeFirstGeneration() {
    const previousLabels = State.labels.slice();
    State.prevLabelsforBlink = previousLabels.slice();
    this.setLabels(previousLabels);

    this.snapshots.set(1, {
      points: this.clonePoints(State.points),
      labels: this.cloneLabels(State.labels),
      centroids: this.cloneCentroids(State.centroids)
    });

    State.blinking = true;
    const graph = new GraphDrawer();

    graph.draw();
    setTimeout(() => {
      State.blinking = false;
      State.changed.fill(false);
      graph.draw();
    });
  }

  async step() {
    if (State.converged) return;
    if (State.iteration >= State.maxIter) {
      await this.end();
      return;
    }

    const nextIteration = Math.max(2, this.snapshots.size + 1);

    State.phase = "Assign";
    const previousLabels = State.labels.slice();
    State.prevLabelsforBlink = previousLabels.slice();
    this.setLabels(previousLabels);

    State.blinking = true;
    new GraphDrawer().draw();
    ControlPanel.update();
    await new Promise(r => setTimeout(r, State.blinkMs));
    State.blinking = false;
    State.changed.fill(false);
    new GraphDrawer().draw();
    await new Promise(r => setTimeout(r, Math.max(0, State.phaseMsAssign - State.blinkMs)));

    this.snapshots.set(nextIteration, {
      points: this.clonePoints(State.points),
      labels: this.cloneLabels(State.labels),
      centroids: this.cloneCentroids(State.centroids)
    });

    if (ControlPanel.sliderIteration === nextIteration) {
      await CODAPConnect.showIteration(nextIteration);
    }

    State.phase("Update");
    this.computeTargets();
    ControlPanel.update();
    await this.moveCentroidsSmooth();

    State.iteration += 1;

    if (this.labelsEqual(previousLabels, State.labels)) {
      State.converged = true;
      State.running = false;
      State.phase = "Done";
    } else {
      State.phase = "—";
    }

    new GraphDrawer().draw();
    ControlPanel.update();
  }

  async run() {
    while (State.running && !State.converged) {
      await this.step();
      await new Promise(r => setTimeout(r, 120));
    }
  }

  async end() {
    State.running = false;
    State.phase = "Max iterations reached";
    new GraphDrawer().draw();
    ControlPanel.update();
    return;
  }

  setLabels(previousLabels) {
    for (let i=0; i < State.points.length; i++){
      const point = State.points[i];

      let bestJ = 0;
      let bestD = Infinity;

      for (let j=0; j < State.centroids.length; j++){
        const c = State.centroids[j];
        const dx = p.x - c.x;
        const dy = p.y - c.y;
        const d2 = dx*dx + dy*dy;
        if (d2 < bestD) { bestD = d2; bestJ = j; }
      }
      State.labels[i] = bestJ;
    }
    for (let i=0; i < State.labels.length;i++){
      State.changed[i] = (State.labels[i] !== previousLabels[i]);
    }
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
        State.centroids[j].x = start[j].x + (target[j].x - start[j].x)*alpha;
        State.centroids[j].y = start[j].y + (target[j].y - start[j].y)*alpha;
      }
      new GraphDrawer().draw();
      await new Promise(r => setTimeout(r, State.phaseMsMove / steps));
    }
  }

  clonePoints() {
    return State.points.map(p => ({ x: p.x, y: p.y }));
  }

  cloneCentroids() {
    return State.centroids.map(c => ({ x: c.x, y: c.y}));
  }

  cloneLabels() {
    return State.labels.slice();
  }

  labelsEqual(a, b) {
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }
}