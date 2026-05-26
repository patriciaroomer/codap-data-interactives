import CODAPConnect from "./CODAPConnect.js";

export default class Graphs {
  
  constructor(mapping, logger) {
    this.mapping = mapping;
    this.log     = logger;
  }

  async createSmallGraphs() {
    const W = 260, H = 180;

    await CODAPConnect.sendRequest({
      action: "create",
			resource: "component",
			values: {
				type: "graph",
				name: "VorhersageVsM5",
				title: `Vorhersage vs ${this.mapping.label("Merkmal5")}`,
				dimensions: { width: W, height: H },
				position: "top",
				xAttributeName: "Vorhersage",
				xAttributeType: "categorical",
				yAttributeName: "Merkmal5",
				yAttributeType: "numeric",
				legendAttributeName: "Klasse",
			}
    })

		await CODAPConnect.sendRequest({
			action: "create",
			resource: "component",
			values: {
				type: "graph",
				name: "KlasseVsVorhersage",
				title: "Klasse vs Vorhersage",
				dimensions: { width: W, height: H },
				position: "top",
				xAttributeName: "Klasse",
				yAttributeName: "Vorhersage"	
			}
		})

    this.log.log("Kleine Graphs erzeugt ✅");
  }
}