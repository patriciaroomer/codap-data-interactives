import State from "../ui/State.js";
import CaseTable from "./CaseTable.js";
import CODAPConnect from "./CODAPConnect.js";

export default class Slider {

	static clustering;
	static currentIteration = 1;
	static pendingIteration = null;
	static sliderReadScheduled = false;
	static sliderUpdateScheduled = false;

	static NAME = "iterSlider";

	static async create() {
		const lower = 1;
		const upper = State.maxIter;
		const start = 1;

		// Create global object
		await CODAPConnect.sendRequest({
			action: "create",
			resource: "global",
			values: { name: Slider.NAME, value: start }
		});

		// Create slider component
		await CODAPConnect.sendRequest({
		action: "create",
		resource: "component",
		values: {
			title: "Iteration",
			type: "slider",
			globalValueName: Slider.NAME,
			lowerBound: lower,
			upperBound: upper,
			dimensions: {
				width: CODAPConnect.WIDGET_WIDTH,
				height: 95
			}
		}
		});
	}

	static handle(request) {
		if (!Slider.sliderChanged(request)) return;
		Slider.queueSliderRead();
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
			resource: `global[${Slider.NAME}]`
		});
		let value = response?.values?.value;
			return Slider.roundSliderValue(value);
	}

	static roundSliderValue(value) {
		const rounded = Math.round(value);
		const lastIteration = Slider.clustering.snapshots.size - 1;

		if (rounded <= 1) return 1;
		if (rounded >= lastIteration) return lastIteration;
		
		return rounded;
	}	

	static async setSliderValue(iteration) {
		await CODAPConnect.sendRequest({
			action: "update",
			resource: `global[${Slider.NAME}]`,
			values: {
				value: iteration
			}
		});
		const snapshot = Slider.clustering.snapshots.get(iteration);
		await CaseTable.showIteration(iteration, snapshot);
	}

	static scheduleIterationRendering(iteration) {
		Slider.pendingIteration = iteration;

		if (Slider.sliderUpdateScheduled) return;
		Slider.sliderUpdateScheduled = true;

		requestAnimationFrame(async () => {
			Slider.sliderUpdateScheduled = false;
			const iter = Slider.pendingIteration;
			await Slider.clustering.showIteration(iter);
		});
	}
}