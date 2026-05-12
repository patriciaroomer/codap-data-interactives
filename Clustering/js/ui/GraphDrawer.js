export default class GraphDrawer {
  constructor() {
    this.colors = [
      "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
      "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"
    ];
  }

  determineColor(label) {
    return this.colors[(label < 0 ? 7 : label) % this.colors.length];
  }
}