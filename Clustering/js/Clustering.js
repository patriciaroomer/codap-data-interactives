export default class Clustering {

  constructor(controlPanel) {
    this.controlPanel = controlPanel;
    this.points = [];
    this.centroids = [];
    this.startCentroids = [];
    this.targetCentroids = [];
    this.labels = [];
    this.prevLabelsForBlink = [];
    this.changed = [];
    this.blinking = false;

    this.iter = 0;
    this.phase = "—";
    this.running = false;
    this.convergent = false;

    this.k = 3;
    this.maxIterations = 25;
    this.showLines = false;

    this.blinkMs = 380;
    this.phaseMsAssign = 720;
    this.phaseMsMove = 780;
    this.moveSteps = 30;
  }

  clonePoints() {
    return this.points.map(p => ({ x: p.x, y: p.y }));
  }

  cloneCentroids() {
    return this.centroids.map(c => ({ x: c.x, y: c.y}));
  }

  cloneLabels() {
    return this.labels.slice();
  }

  parseSeed() {
    const t = (this.controlPanel.seed || "").trim();
    if (!t) return null;
    if (!/^-?\d+$/.test(t)) return null;
    return parseInt(t, 10);
  }

  makeLCG(seedInt) {
    let state = (seedInt >>> 0) || 123456789;
    return function rand01() {
      state = (1103515245 * (state & 0x7fffffff) + 12345) & 0x7fffffff;
      return state / 0x80000000;
    };
  }

}