export default class Sociogram {
    constructor(interactionMatrix) {
        this.interactionMatrix = interactionMatrix;

        this.canvas = document.getElementById("sociogram");
        this.canvas.innerHTML = "";
        const rect = this.canvas.getBoundingClientRect();
        this.width = rect.width;
        this.height = rect.height;
        
        this.circle = "http://www.w3.org/2000/svg"
        this.text = "http://www.w3.org/2000/svg";
        this.line = "http://www.w3.org/2000/svg";
        
        this.nodeSize = 30;
        this.draw();
    }

    draw() {
        this.drawNodes();
        this.drawEdges();
    }
    
    drawNodes() {
        const nodes = [];
        const users = this.interactionMatrix.getUsers();

        for (const user of users) {
            
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;
            
            const circle = this.drawCircle(x, y);
            const label = this.drawLabel(x, y, user);

            nodes.push({ id: user, x, y, circle, label });        
        }
        this.nodes = nodes;
        
        // Bound inside canvas
        for (const node of this.nodes) {
            node.x = Math.max(this.nodeSize, Math.min(this.width - this.nodeSize, node.x));
            node.y = Math.max(this.nodeSize, Math.min(this.height - this.nodeSize, node.y));
        }
    }   

    drawEdges() {
        const edges = [];
        const users = this.interactionMatrix.getUsers();

        for (let i = 0; i < users.length; i++) {
            for (let j = i + 1; j < users.length; j++) {
                const u1 = users[i];
                const u2 = users[j];

                if (u1 === u2) continue;
                const [r1, r2] = this.interactionMatrix.getUserVectors(u1, u2);
                const similarity = this.computeSimilarity(r1, r2);

                const n1 = this.nodes.find(n => n.id === u1);
                const n2 = this.nodes.find(n => n.id === u2);   
                const line = this.drawLine(n1, n2);

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

    drawLine(source, target) {
        const line = document.createElementNS(this.line, "line");
        line.setAttribute("x1", source.x);
        line.setAttribute("y1", source.y);
        line.setAttribute("x2", target.x);
        line.setAttribute("y2", target.y);
        line.setAttribute("stroke", "gray");
        line.setAttribute("stroke-width", 2);
        
        this.canvas.appendChild(line);
        return line;
    }
}