export default class SociogramLayout {
    constructor(sociogram, width, height, iterations = 300) {
        this.nodes = sociogram.nodes;
        this.edges = sociogram.edges;
        
        this.width = width;
        this.height = height;

        this.scale = sociogram.similarityMeasure.scale;
        this.equil = 250;

        for (let i = 0; i < iterations; i++) {
            this.repulse();
            this.attract();
            this.move();
        }
    }

    repulse() {
        const wall = 2000;

        for (const n1 of this.nodes) {
            for (const n2 of this.nodes) {
                if (n1 === n2) continue;

                const dx = n1.x - n2.x;
                const dy = n1.y - n2.y;

                const dist = Math.max(10, Math.hypot(dx, dy));
                const force = 4000 / (dist * dist);

                n1.vx += dx / dist * force;
                n1.vy += dy / dist * force;
            }

            n1.vx += wall / ((n1.x + 1) ** 2);
            n1.vx -= wall / ((this.width - n1.x + 1) ** 2);
        
            n1.vy += wall / ((n1.y + 1) ** 2);
            n1.vy -= wall / ((this.height - n1.y + 1) ** 2);
        }
    }

    attract() {
        for (const edge of this.edges) {
            
            const dx = edge.target.x - edge.source.x;
            const dy = edge.target.y - edge.source.y;

            const dist = Math.max(1, Math.hypot(dx, dy));
            const idealDist = this.scale * 200 * (1 - edge.similarity);
            const force = (dist - idealDist) * 0.02;;

            edge.source.vx += dx / dist * force;
            edge.source.vy += dy / dist * force;

            edge.target.vx -= dx / dist * force;
            edge.target.vy -= dy / dist * force;
        }
    }

    move() {
        for (const node of this.nodes) {
            node.x += node.vx;
            node.y += node.vy;

            node.vx *= 0.85;
            node.vy *= 0.85;
        }
    }
}