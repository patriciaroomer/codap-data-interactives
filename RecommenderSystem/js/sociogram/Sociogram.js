export default class Sociogram {
    constructor(interactionMatrix) {
        this.interactionMatrix = interactionMatrix;

        this.canvas = document.getElementById("sociogram");
        this.canvas.innerHTML = "";
        
        const rect = this.canvas.getBoundingClientRect();
        this.width = rect.width;
        this.height = rect.height;
        this.scale = Math.min(this.width, this.height) * 2;
        
        this.circle = "http://www.w3.org/2000/svg"
        this.text = "http://www.w3.org/2000/svg";
        this.line = "http://www.w3.org/2000/svg";
        
        this.nodeSize = 30;
    }

    createSimilarityMatrix() {
        const users = this.interactionMatrix.getUsers();
        const similarityMatrix = new Map();

        for (let i = 0; i < users.length; i++) {
            for (let j = i + 1; j < users.length; j++) {

                const u1 = users[i];
                const u2 = users[j];

                const [r1, r2] = this.interactionMatrix.getUserVectors(u1, u2);
                const s = this.computeSimilarity(r1, r2);

                similarityMatrix.set(`${u1}-${u2}`, s);
                similarityMatrix.set(`${u2}-${u1}`, s);
            }
        }

        return similarityMatrix;
    }

    draw() {
        this.drawNodes();
        this.relaxLayout();
        this.syncNodesToDOM();
        this.drawEdges();
    }
    
    drawNodes() {
        const nodes = [];
        const users = this.interactionMatrix.getUsers();
        const n = users.length;

        for (let i = 0; i < n; i++) {
            const user = users[i];

            const angle = (2 * Math.PI * i) / n;

            const x = this.width / 2 + Math.cos(angle) * 150;
            const y = this.height / 2 + Math.sin(angle) * 150;

            const circle = this.drawCircle(x, y);
            const label = this.drawLabel(x, y, user);

            nodes.push({
                id: user,
                x,
                y,
                circle,
                label
            });
        }

        this.nodes = nodes;
    }

    drawEdges() {
        const edges = [];
        const users = this.interactionMatrix.getUsers();

        for (let i = 0; i < users.length; i++) {
            for (let j = i + 1; j < users.length; j++) {
                const u1 = users[i];
                const u2 = users[j];

                if (u1 === u2) continue;
                const similarity = this.normalizeSimilarity(
                    this.similarityMatrix.get(`${u1}-${u2}`) ?? 0);

                if (similarity < this.similarityThreshold) continue;

                const n1 = this.nodes.find(n => n.id === u1);
                const n2 = this.nodes.find(n => n.id === u2);   
                const line = this.drawLine(n1, n2, similarity);

                edges.push({ source: n1, target: n2, weight: similarity, line });
            }
        }
        this.edges = edges;
    }

    drawCircle(x, y) {
        const circle = document.createElementNS(this.circle, "circle");
        circle.setAttribute("cx", x);
        circle.setAttribute("cy", y);
        circle.setAttribute("r", this.nodeSize);
        circle.setAttribute("fill", "#4A90E2");
        circle.setAttribute("stroke", "#2C5F9E");
        circle.setAttribute("stroke-width", 2);

        this.canvas.appendChild(circle);
        return circle;
    }

    drawLabel(x, y, text) {
        const label = document.createElementNS(this.text, "text");
        label.setAttribute("x", x);
        label.setAttribute("y", y);
        label.setAttribute("text-anchor", "middle");
        label.setAttribute("fill", "white");
        label.textContent = text;
        
        this.canvas.appendChild(label);
        return label;
    }

    drawLine(source, target, weight) {
        const line = document.createElementNS(this.line, "line");
        line.setAttribute("x1", source.x);
        line.setAttribute("y1", source.y);
        line.setAttribute("x2", target.x);
        line.setAttribute("y2", target.y);
        line.setAttribute("stroke", "gray");
        line.setAttribute("stroke-width", 1);
        
        this.canvas.insertBefore(line, this.canvas.firstChild);
        return line;
    }

    relaxLayout(iterations = 1000) {
        const nodes = this.nodes;
        const cx = this.width / 2;
        const cy = this.height / 2;

        for (let iter = 0; iter < iterations; iter++) {

            // Attraction/repulsion between every pair
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const a = nodes[i];
                    const b = nodes[j];

                    const key = `${a.id}-${b.id}`;
                    const similarity = this.normalizeSimilarity(
                        this.similarityMatrix.get(key) ?? 0
                    );

                    const desiredDist = this.getDesiredDistance(similarity);

                    const dx = b.x - a.x;
                    const dy = b.y - a.y;
                    const dist = Math.sqrt(dx * dx + dy * dy) + 0.01;

                    // Spring force: pull together if too far, push apart if too close
                    const springForce = (dist - desiredDist) / dist * 0.15;
                    const fx = springForce * dx;
                    const fy = springForce * dy;

                    a.x += fx;
                    a.y += fy;
                    b.x -= fx;
                    b.y -= fy;

                    // Minimum separation repulsion (prevents overlap)
                    if (dist < this.nodeSize * 2.5) {
                        const push = (this.nodeSize * 2.5 - dist) / dist * 0.5;
                        a.x -= push * dx;
                        a.y -= push * dy;
                        b.x += push * dx;
                        b.y += push * dy;
                    }
                }
            }

            // Centering force: gently pull all nodes toward canvas center
            for (const n of nodes) {
                n.x += (cx - n.x) * 0.01;
                n.y += (cy - n.y) * 0.01;
            }
        }

        // Clamp inside canvas
        for (const n of nodes) {
            n.x = Math.max(this.nodeSize * 1.5, Math.min(this.width - this.nodeSize * 1.5, n.x));
            n.y = Math.max(this.nodeSize * 1.5, Math.min(this.height - this.nodeSize * 1.5, n.y));
        }
    }

    syncNodesToDOM() {
        for (const n of this.nodes) {
            n.circle.setAttribute("cx", n.x);
            n.circle.setAttribute("cy", n.y);

            n.label.setAttribute("x", n.x);
            n.label.setAttribute("y", n.y);
        }
    }
}