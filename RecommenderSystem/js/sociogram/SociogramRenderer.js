export default class SociogramRenderer {
    constructor(sociogram) {
        this.sociogram = sociogram;
        
        this.canvas = document.getElementById("sociogram");
        this.canvas.innerHTML = "";
        
        const rect = this.canvas.getBoundingClientRect();
        this.width = rect.width;
        this.height = rect.height;
        
        this.source = "http://www.w3.org/2000/svg";
        this.cFill = "#4a90e2";
        this.cStroke = "#2c5f9e";
        this.cWidth = 2;
        this.r = 30;
        this.lStroke = "gray";
        this.lWidth = 1;
        this.tFill = "white";
    }

    render() {
        this.drawNodes();
        this.drawEdges();
        this.drawTexts();
    }

    drawNodes() {
        const nodes = this.sociogram.nodes;
        const n = nodes.length;

        for (let i = 0; i < n; i++) {
            const node = nodes[i];
            const angle = (2 * Math.PI * i) / n;
            const x = this.width / 2 + Math.cos(angle) * 150;
            const y = this.height / 2 + Math.sin(angle) * 150;
            node.x = x;
            node.y = y;
            this.drawNode(node);
        }
    }

    drawNode(node) {
        const circle = document.createElementNS(this.source, "circle");
        circle.setAttribute("cx", node.x);
        circle.setAttribute("cy", node.y);
        circle.setAttribute("r", this.r);
        circle.setAttribute("fill", this.cFill);
        circle.setAttribute("stroke", this.cStroke);
        circle.setAttribute("stroke-width", this.cWidth);
        
        this.canvas.appendChild(circle);
    }

    drawEdges() {
        const edges = this.sociogram.edges;
        const n = edges.length;

        for (let i = 0; i < n; i++) {
            this.drawEdge(edges[i]);
        }
    }

    drawEdge(edge) {
        const line = document.createElementNS(this.source, "line");
        line.setAttribute("x1", edge.source.x);
        line.setAttribute("y1", edge.source.y);
        line.setAttribute("x2", edge.target.x);
        line.setAttribute("y2", edge.target.y);
        line.setAttribute("stroke", this.lStroke);
        line.setAttribute("stroke-width", this.lWidth);

        this.canvas.insertBefore(line, this.canvas.firstChild);        
    }

    drawTexts() {
        const nodes = this.sociogram.nodes;
        const n = nodes.length;

        for (let i = 0; i < n; i++) {
            this.drawText(nodes[i]);
        }
    }

    drawText(node) {
        const text = document.createElementNS(this.source, "text");
        text.setAttribute("x", node.x);
        text.setAttribute("y", node.y);
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("fill", this.tFill);
        text.textContent = node.user;

        this.canvas.appendChild(text);
    }
}