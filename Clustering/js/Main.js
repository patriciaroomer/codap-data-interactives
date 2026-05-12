import Clustering from './clustering/Clustering.js';
import CODAPConnect from './codap/CODAPConnect.js';
import ControlPanel from './ui/ControlPanel.js';
import State from './ui/State.js';

const title = "Clustering";
const version = "v0.1";
const dimensions = { width: 500, height: 600 };
const preventBringToFront = false;

async function init() {
  new Clustering().initialize();
  ControlPanel.update();

  await CODAPConnect.createGraphComponent();
  await CODAPConnect.createSliderComponent(1, Math.max(1, State.maxIter), 1);

  ControlPanel.msg.innerHTML = `<span class="ok">Datensatz + Streudiagramm + Slider erstellt.</span>`;
  ControlPanel.sliderIteration = 1;
  document.getElementById("shownIter").textContent = "1";
  await CODAPConnect.showIteration(1);
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
  await init();
  await CODAPConnect.sendRequest({ action: "get", resource: "document" });
  await createFrame();
}

main();