import Clustering from './clustering/Clustering.js';
import CODAPConnect from './codap/CODAPConnect.js';
import ControlPanel from './ui/ControlPanel.js';
import GraphDrawer from './ui/GraphDrawer.js';
import State from './ui/State.js';

const title = "Clustering";
const version = "v0.1";
const dimensions = { width: 500, height: 600 };
const preventBringToFront = false;

async function init() {
  const clustering = new Clustering();
  clustering.initialize();

  ControlPanel.update();
  await CODAPConnect.createGraphComponent();
  await CODAPConnect.createSliderComponent(1, Math.max(1, State.maxIter), 1);
  console.log("UI initialized");

  ControlPanel.msg.innerHTML = `<span class="ok">Datensatz + Streudiagramm + Slider erstellt.</span>`;
  ControlPanel.sliderIteration = 1;
  document.getElementById("shownIter").textContent = "1";

  await CODAPConnect.showIteration(1, clustering.snapshots.get(1));
}

async function createFrame() {
  await CODAPConnect.sendRequest({
    action: "update",
    resource: "interactiveFrame",
    values: {
      title,
      version,
      dimensions,
      preventBringToFront
    }
  });
}

async function main() {
  await CODAPConnect.sendRequest({ action: "get", resource: "document" });
  await createFrame();
  ControlPanel.init(new GraphDrawer());
  await init();
}

main();