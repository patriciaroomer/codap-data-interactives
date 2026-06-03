import CODAPConnect from "./CODAPConnect.js";

export default class Slider {

	static clustering;
	static currentIteration = 1;
	static pendingIteration = null;
	static sliderReadScheduled = false;
	static sliderUpdateScheduled = false;

	static sliderChanged(request) {
    return request.action === "notify" &&
           request.resource === "component" &&
           request.values?.operation === "change slider value" &&
           request.values?.type === "DG.SliderView";
  }

	static async queueSliderRead() {
		if (Slider.sliderReadScheduled) return;
		Slider.sliderReadScheduled = true;

		const iteration = await this.getSliderValue();
		Slider.sliderReadScheduled = false;
		Slider.currentIteration = iteration;
		Slider.scheduleIterationRendering(iteration);
	}

	static async getSliderValue() {
    const response = await CODAPConnect.sendRequest({
      action: "get",
      resource: `global[${CODAPConnect.SLIDER}]`
    });
    const iteration = response?.values?.value;
    return Math.round(iteration);
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