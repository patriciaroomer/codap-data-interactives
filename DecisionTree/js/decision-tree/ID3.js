export default class ID3 {
    constructor(targetAttribute = 'targetClass') {
        this.targetAttribute = targetAttribute;
    }

    train(data) {
        const attributes = Object.keys(data[0]).filter(
            key => key !== this.targetAttribute && key !== 'Name'
        );

        const attrValues = {};
        for (const attr of attributes) {
            attrValues[attr] = [...new Set(data.map(row => row[attr]))];
        }

        return this.buildTree(data, attributes, attrValues);
    }

    buildTree(data, attributes, attrValues) {
        const classes = [...new Set(data.map(row => row[this.targetAttribute]))];

        // All examples belong to the same class
        if (classes.length === 1) {
            return {
                type: 'leaf',
                class: classes[0]
            };
        }

        // No attributes left
        if (attributes.length === 0) {
            return {
                type: 'leaf',
                class: this.majorityClass(data)
            };
        }

        const bestAttribute = this.findBestAttribute(data, attributes);

        const node = {
            type: 'node',
            attribute: bestAttribute,
            children: {}
        };

        const values = attrValues[bestAttribute];

        for (const value of values) {
            const subset = data.filter(
                row => row[bestAttribute] === value
            );

            if (subset.length === 0) {
                node.children[value] = {
                    type: 'leaf',
                    class: this.majorityClass(data)
                };
            } else {
                const remainingAttributes = attributes.filter(
                    attr => attr !== bestAttribute
                );

                node.children[value] = this.buildTree(
                    subset,
                    remainingAttributes,
                    attrValues
                );
            }
        }

        return node;
    }

    entropy(data) {
        const total = data.length;

        const counts = {};

        for (const row of data) {
            const cls = row[this.targetAttribute];
            counts[cls] = (counts[cls] || 0) + 1;
        }

        let entropy = 0;

        for (const count of Object.values(counts)) {
            const p = count / total;
            entropy -= p * Math.log2(p);
        }

        return entropy;
    }

    informationGain(data, attribute) {
        const totalEntropy = this.entropy(data);
        const totalSize = data.length;

        const values = [...new Set(data.map(row => row[attribute]))];

        let weightedEntropy = 0;

        for (const value of values) {
            const subset = data.filter(
                row => row[attribute] === value
            );

            weightedEntropy +=
                (subset.length / totalSize) *
                this.entropy(subset);
        }

        return totalEntropy - weightedEntropy;
    }

    findBestAttribute(data, attributes) {
        let bestAttribute = null;
        let bestGain = -Infinity;

        for (const attribute of attributes) {
            const gain = this.informationGain(data, attribute);

            if (gain > bestGain) {
                bestGain = gain;
                bestAttribute = attribute;
            }
        }

        return bestAttribute;
    }

    majorityClass(data) {
        const counts = {};

        for (const row of data) {
            const cls = row[this.targetAttribute];
            counts[cls] = (counts[cls] || 0) + 1;
        }

        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])[0][0];
    }

    predict(tree, sample, path = []) {
        if (tree.type === 'leaf') {
            path.push({ node: tree });
            return { class: tree.class, path };
        }

        const value = sample[tree.attribute];
        const child = tree.children[value];

        path.push({ node: tree, edgeTo: child, edgeLabel: value });

        if (!child) {
            return { class: null, path };
        }

        return this.predict(child, sample, path);
    }

    static assignIds(node, counter = { value: 0 }) {
        node.id = `n${counter.value++}`;

        if (node.type === 'node') {
            for (const child of Object.values(node.children)) {
                this.assignIds(child, counter);
            }
        }
    }   
}