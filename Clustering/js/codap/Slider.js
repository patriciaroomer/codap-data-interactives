import State from "../ui/State.js";
import CaseTable from "./CaseTable.js";
import CODAPConnect from "./CODAPConnect.js";

export default class Slider {

	static clustering;
	static currentIteration = 1;
	static pendingIteration = null;
	static sliderReadScheduled = false;
	static sliderUpdateScheduled = false;

	static async create() {
		const lower = 0;
		const upper = State.maxIter;
		const start = 0;

		// Create global object
		await CODAPConnect.sendRequest({
      action: "create",
      resource: "global",
      values: { name: CODAPConnect.SLIDER, value: start }
    });

		// Create slider component
    await CODAPConnect.sendRequest({
      action: "create",
      resource: "component",
      values: {
        title: "Iteration",
        type: "slider",
        globalValueName: CODAPConnect.SLIDER,
        lowerBound: lower,
        upperBound: upper,
        dimensions: {
          width: CODAPConnect.WIDGET_WIDTH,
          height: 95
        }
      }
    });
	}

	static sliderChanged(request) {
    return request.action === "notify" &&
           request.resource === "component" &&
           request.values?.operation === "change slider value" &&
           request.values?.type === "DG.SliderView";
  }

	static async queueSliderRead() {
		if (Slider.sliderReadScheduled) return;
		Slider.sliderReadScheduled = true;

		const iteration = await Slider.getSliderValue();
		Slider.setSliderValue(iteration); // Set rounded value
		Slider.sliderReadScheduled = false;
		Slider.currentIteration = iteration;
		Slider.scheduleIterationRendering(iteration);
	}

	static async getSliderValue() {
		const response = await CODAPConnect.sendRequest({
		action: "get",
		resource: `global[${CODAPConnect.SLIDER}]`
		});
		let value = response?.values?.value;
			return Slider.roundSliderValue(value);
	}

	static roundSliderValue(value) {
		const rounded = Math.round(value);
		const lastIteration = Slider.clustering.snapshots.size - 1;

		if (rounded < 0) return 0;
		if (rounded > lastIteration) return lastIteration;
		
		return rounded;
	}	

	static async setSliderValue(iteration) {
		await CODAPConnect.sendRequest({
			action: "update",
			resource: `global[${CODAPConnect.SLIDER}]`,
			values: {
				value: iteration
			}
		});
		CaseTable.showIteration(iteration, Slider.clustering.snapshots.get(iteration));
	}

	static scheduleIterationRendering(iteration) {
		Slider.pendingIteration = iteration;

		if (Slider.sliderUpdateScheduled) return;
		Slider.sliderUpdateScheduled = true;

		requestAnimationFrame(() => {
			Slider.sliderUpdateScheduled = false;
			const iter = Slider.pendingIteration;
			Slider.clustering.showIteration(iter);
		});
	}
}