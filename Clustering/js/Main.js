import Clustering from './clustering/Clustering.js';
import CaseTable from './codap/CaseTable.js';
import CODAPConnect from './codap/CODAPConnect.js';
import DataContext from './codap/DataContext.js';
import Graph from './codap/Graph.js';
import Slider from './codap/Slider.js';
import ControlPanel from './ui/ControlPanel.js';
import GraphDrawer from './ui/GraphDrawer.js';
import State from './ui/State.js';

const title = "Clustering";
const version = "v0.1";
const dimensions = { width: 800, height: 1100 };
const preventBringToFront = false;

async function init() {
  const clustering = new Clustering();
  clustering.initialize();

  ControlPanel.update();

  await DataContext.createDefault();
  await Graph.create();
  await Slider.create();
  
  ControlPanel.sliderIteration = 0;
  
  await CaseTable.create();
  await CaseTable.showIteration(0, clustering.snapshots.get(0));
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