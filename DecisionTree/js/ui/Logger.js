export default class Logger {
	constructor() {
		this.element = document.getElementById("log");
	}

	log(...args) {
		const line = args
      .map((a) => (typeof a === 'string' ? a : JSON.stringify(a, null, 2)))
      .join(' ');
    this.element.textContent += '\n' + line;
    this.element.scrollTop = this.element.scrollHeight;
	}
}