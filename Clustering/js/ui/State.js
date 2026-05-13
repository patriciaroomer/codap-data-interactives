export default class State {
  static points = [];
  static centroids = [];
  static startCentroids = [];
  static targetCentroids = [];
  static labels = [];
  static prevLabelsforBlink = [];
  static changed = [];
  static blinking = false;

  static iteration = 1;
  static phase = "—";
  static running = false;
  static converged = false;

  static k = 3;
  static n = 60;
  static maxIter = 25;
  static showLines = false;

  static blinkMs = 380;
  static phaseMsAssign = 720;
  static phaseMsMove = 780;
  static moveSteps = 30;
}