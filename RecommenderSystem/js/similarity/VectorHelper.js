export default class VectorHelper {

    static dot(v, w) {
        let result = 0;
        for (let i = 0; i < v.length; i++) {
            result += (v[i] * w[i]);
        }
        return result;
    }

    static length(v) {
        let result = 0;
        for (let i = 0; i < v.length; i++) {
            result += (v[i] * v[i]);
        }
        return Math.sqrt(result);
    }

    static mean(v) {
        let result = 0;
        const length = v.length;
        for (let i = 0; i < length; i++) {
            result += v[i];
        }
        return result / length;
    }

    static center(v) {
        const result = [];
        const mean = this.mean(v);

        for (let i = 0; i < v.length; i++) {
            result.push(v[i] - mean);
        }
        return result;
    }
}