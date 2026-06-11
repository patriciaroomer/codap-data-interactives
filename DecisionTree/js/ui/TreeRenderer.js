import TreeLayout from "../decision-tree/TreeLayout.js";

export default class TreeRenderer {

    constructor(svgEl, infoEl) {
        this.svg = svgEl;
        this.info = infoEl;
    }

    render(root, highlightPath = []) {

        this.svg.innerHTML = "";

        if (!root) {
            this.info.textContent = "No decision tree available.";
            return;
        }

        const graph = TreeLayout.generate(root);

        const pathEdges = new Set(highlightPath.filter(p => p.edgeTo).map(p => `${p.node.id}-${p.edgeTo.id}`));
        const pathNodes = new Set(highlightPath.map(p => p.node));

        this._drawEdges(graph.edges, pathEdges);
        this._drawNodes(graph.nodes, pathNodes);

        const xs = graph.nodes.map(n => n.x);
        const ys = graph.nodes.map(n => n.y);
        const padding = 120;
        const minX = Math.min(...xs) - padding;
        const minY = Math.min(...ys) - padding;
        const maxX = Math.max(...xs) + padding;
        const maxY = Math.max(...ys) + padding;
        this.svg.setAttribute("viewBox", `${minX} ${minY} ${maxX - minX} ${maxY - minY}`);
        this.svg.setAttribute("width", "100%");
        this.svg.setAttribute("height", "100%");

        this.info.textContent =
            "Decision tree trained successfully.";
    }

    _drawEdges(edges, pathEdges = new Set()) {

        for (const edge of edges) {
            const key = `${edge.fromNode.id}-${edge.toNode.id}`;
            const isHighlighted = pathEdges.has(key);

            const A = edge.from;
            const B = edge.to;

            const mx = (A.x + B.x) / 2;
            const path = this._el("path");

            path.setAttribute(
                "d",
                `M ${A.x} ${A.y}
                 C ${mx} ${A.y},
                   ${mx} ${B.y},
                   ${B.x} ${B.y}`
            );

            path.setAttribute("class", "edge");
            this.svg.appendChild(path);

            const text = this._el("text");
            text.setAttribute("x", (A.x + B.x) / 2);
            text.setAttribute("y", (A.y + B.y) / 2 - 8);
            text.setAttribute("text-anchor", "middle");
            text.setAttribute("class", "badge");
            text.textContent = edge.label;

            this.svg.appendChild(text);

            path.setAttribute("class", isHighlighted ? "edge edge--highlight" : "edge");
        }
    }

    _drawNodes(nodes, pathNodes = new Set()) {

        for (const node of nodes) {
            const isHighlighted = pathNodes.has(node.node);

            const width = 220;
            const height = 40;

            const g = this._el("g");
            const rect = this._el("rect");

            rect.setAttribute("x", node.x - width / 2);
            rect.setAttribute("y", node.y - height / 2);
            rect.setAttribute("width",width);
            rect.setAttribute("height", height);
            rect.setAttribute("rx", 10);
            rect.setAttribute("ry", 10);
            rect.setAttribute("class", "node");

            g.appendChild(rect);

            const text = this._el("text");
            text.setAttribute("x", node.x);
            text.setAttribute("y", node.y + 4);
            text.setAttribute("text-anchor", "middle");
            text.setAttribute("class", "nodeText");
            text.textContent = node.label;

            g.appendChild(text);

            this.svg.appendChild(g);

            rect.setAttribute('class', isHighlighted ? 'node node--highlight' : 'node')
        }
    }

    _el(tag) {
        return document.createElementNS(
            "http://www.w3.org/2000/svg",
            tag
        );
    }
}