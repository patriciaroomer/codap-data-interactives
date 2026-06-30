export default class EuclideanSimilarity {

    static scale = 2;

    static compute(v, w) {
        let result = 0;
        for (let i = 0; i < v.length; i++) {
            const diff = v[i] - w[i];
            result += (diff * diff);        
        }
        result = Math.sqrt(result);
        return 1 / (1 + result);
    }
}