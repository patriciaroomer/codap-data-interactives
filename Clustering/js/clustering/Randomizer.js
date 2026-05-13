import ControlPanel from '../ui/ControlPanel.js';

export default class Randomizer {

  constructor() {
    this.seed = this.parseSeed(ControlPanel.seed.value);
  }

  generate() {
    return this.makeLCG(this.seed === null ? (Date.now() & 0x7fffffff) : (seed & 0x7fffffff));
  }

  parseSeed() {
    const t = (this.seed || "").trim();
    if (!t) return null;
    if (!/^-?\d+$/.test(t)) return null;
    return parseInt(t, 10);
  }

  makeLCG(seedInt) {
    let state = (seedInt >>> 0) || 123456789;
    return function rand01() {
      state = (1103515245 * (state & 0x7fffffff) + 12345) & 0x7fffffff;
      return state / 0x80000000;
    };
  }
}