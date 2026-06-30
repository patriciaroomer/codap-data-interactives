import SociogramRenderer from "./SociogramRenderer.js";

export default class Sociogram {
    constructor(interactionMatrix, similarityMeasure) {
        this.interactionMatrix = interactionMatrix;
        this.similarityMeasure = similarityMeasure;
        this.users = interactionMatrix.getUsers();

        this.nodes = [];
        this.edges = [];

        this.createSimilarityMatrix();
        this.build();
    }

    draw() {
        new SociogramRenderer(this).render();
    }

    createSimilarityMatrix() {
        const n = this.users.length;
        this.similarityMatrix = Array.from({ length: n }, () => new Array(n));

        for (let i = 0; i < this.users.length; i++) {
            for (let j = 0; j < this.users.length; j++) {
                const [ r1, r2 ] = this.interactionMatrix.getUserRatings(this.users[i], this.users[j]);
                const similarity = this.similarityMeasure.compute(r1, r2);
                this.similarityMatrix[i][j] = similarity;
            }
        }
    }

    build(threshold = 0.9) {
        // Nodes
        for (let i = 0; i < this.users.length; i++) {
            this.addNode(this.users[i]);
        }
        
        // Edges
        for (let i = 0; i < this.users.length; i++) {
            for (let j = i + 1; j < this.users.length; j++) {
                const similarity = this.similarityMatrix[i][j];
                if (similarity >= threshold) {
                    this.addEdge(this.nodes[i], this.nodes[j]);
                }
            }
        }
    }

    addNode(user) {
        this.nodes.push({ user: user, x: 0, y: 0 });
    }

    addEdge(source, target) {
        this.edges.push({ source: source, target: target });
    }

}