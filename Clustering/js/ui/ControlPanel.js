export default class ControlPanel {
  constructor() {
    this.k = document.getElementById("k");
    this.n = document.getElementById("n");
    this.seed = document.getElementById("seed");
    this.maxIterations = document.getElementById("maxIter");
    this.toggleLines = document.getElementById("toggleLines");

    this.resetButton = document.getElementById("btnReset");
    this.startButton = document.getElementById("btnStart");
    this.pauseButton = document.getElementById("btnPause");
    this.stepButton = document.getElementById("btnStep");
    this.restartButton = document.getElementById("btnRestart");

    this.iteration = document.getElementById("iter");
    this.phase = document.getElementById("phase");
    this.convergent = document.getElementById("conv");
    this.codapStatus = document.getElementById("codapStatus");
    this.msg = document.getElementById("msg");
  }
}