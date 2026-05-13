import State from './State.js';

export default class GraphDrawer {
  constructor() {
    this.canvas = document.getElementById("cv");
    this.context = this.canvas.getContext("2d");
    this.pad = 32;
    this.grid = 8;
    this.radius = 8;

    this.colors = [
      "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
      "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"
    ];
  }

  draw() {
    this.drawGrid();

    if (State.showLines) {
      this.drawLinesToCentroids();
    }

    this.drawPoints();
    this.drawCentroids();

    this.context.fillStyle = "rgba(0, 0, 0, 0.8)";
    this.context.font = "13px system-ui";
    this.context.fillText(`k=${State.k}  n=${State.points.length}  iter=${State.iter}/${State.maxIter}  phase=${State.phase}`, 12, 18);
  }

  drawGrid() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.lineWidth = 1;
    this.context.strokeStyle = "rgba(0, 0, 0, 0.10)";

    // Background grid
    for (let i = 0; i <= this.grid; i++) {
      const x = this.pad + i * (this.canvas.width - 2 * this.pad) / this.grid;
      this.drawStroke(x, this.pad, x, this.canvas.height - this.pad);

      const y = this.pad + i * (this.canvas.height - 2 * this.pad) / this.grid;
      this.drawStroke(this.pad, y, this.canvas.width - this.pad, y);
    }

    this.context.strokeStyle = "rgba(0, 0, 0, 0.25)";

    // Y axis
    let [x0, y0] = this.toCanvas(0, -1);
    let [x1, y1] = this.toCanvas(0, 1);
    this.drawStroke(x0, y0, x1, y1);

    // X axis
    [x0, y0] = this.toCanvas(-1, 0);
    [x1, y1] = this.toCanvas(1, 0);
    this.drawStroke(x0, y0, x1, y1);
  }

  drawLinesToCentroids() {
    this.context.lineWidth = 1;
      this.context.strokeStyle = "rgba(0, 0, 0, 0.18)";
      for (let i = 0; i < State.points.length; i++) {
        const label = State.labels[i];
        if (label < 0) continue;
        const point = State.points[i];
        const centroid = State.centroids[label];
        const [px, py] = this.toCanvas(point.x, point.y);
        const [cx, cy] = this.toCanvas(centroid.x, centroid.y);
        this.drawStroke(px, py, cx, cy);
      }
  }

  drawPoints() {
    for (let i = 0; i < State.points.length; i++) {
      const point = State.points[i];
      const newLabel = State.labels[i];
      const oldLabel = State.prevLabelsforBlink[i];
      const [cx, cy] = this.toCanvas(point.x, point.y);

      if (State.blinking && State.changed[i]) {
        // Outer circle (new)
        this.context.fillStyle = this.determineColor(newLabel);
        this.drawCircle(cx, cy, radius);

        // Inner circle (old)
        this.context.fillStyle = this.determineColor(oldLabel);
        this.drawCircle(cx, cy, radius - 3);

        // Ring
        this.context.lineWidth = 3;
        this.context.strokeStyle = "rgba(0, 0, 0, 0.40)";
        this.drawRing(cx, cy, radius + 2);

        continue;
      }

      // Only new color
      this.context.fillStyle = this.determineColor(newLabel);
      this.drawCircle(cx, cy, 4);
    }
  }

  drawCentroids() {
    for (let j = 0; j < State.centroids.length; j++) {
      const centroid = State.centroids[i];
      const [cx, cy] = this.toCanvas(centroid.x, centroid.y);

      this.context.strokeStyle = determineColor(j);
      this.context.lineWidth = 3;
      this.drawCentroid(cx, cy);

      this.context.fillStyle = "rgba(0, 0, 0, 0.8)";
      this.context.font = "12px system-ui";
      this.context.fillText("C"+ (j + 1), cx + 12, cy - 12);
    }
  }

  drawStroke(startX, startY, endX, endY) {
    this.context.beginPath();
    this.context.moveTo(startX, startY);
    this.context.lineTo(endX, endY);
    this.context.stroke();
  }

  drawCircle(x, y, radius) {
    this.context.beginPath();
    this.context.arc(x, y, radius, 0, Math.PI * 2);
    this.context.fill();
  }

  drawRing(x, y, radius) {
    this.context.beginPath();
    this.context.arc(x, y, radius, 0, Math.PI * 2);
    this.context.stroke();
  }

  drawCentroid(x, y) {
    this.context.beginPath();
    this.context.moveTo(x - 11, y - 11);
    this.context.lineTo(x + 11, y + 11);
    this.context.moveTo(x + 11, y - 11);
    this.context.lineTo(x - 11, y + 11);
    this.context.stroke();
  }

  toCanvas(x, y) {
    const w = this.canvas.width - 2 * this.pad;
    const h = this.canvas.height - 2 * this.pad;
    const cx = this.pad + (x + 1) * (w / 2);
    const cy = this.pad + (1 - (y + 1) / 2) * h;
    return [cx, cy];
  }

  determineColor(label) {
    return this.colors[(label < 0 ? 7 : label) % this.colors.length];
  }
}