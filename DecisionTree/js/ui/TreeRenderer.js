import TreeLayout from "../decision-tree/TreeLayout.js";

export default class TreeRenderer {

    constructor(svgEl, infoEl) {
        this.svg = svgEl;
        this.info = infoEl;
    }

    render(root) {

        this.svg.innerHTML = "";

        if (!root) {
            this.info.textContent =
                "No decision tree available.";
            return;
        }

        const graph =
            TreeLayout.generate(root);

        this._drawEdges(graph.edges);
        this._drawNodes(graph.nodes);

        this.info.textContent =
            "Decision tree trained successfully.";
    }

    _drawEdges(edges) {

        for (const edge of edges) {

            const A = edge.from;
            const B = edge.to;

            const mx =
                (A.x + B.x) / 2;

            const path =
                this._el("path");

            path.setAttribute(
                "d",
                `M ${A.x} ${A.y}
                 C ${mx} ${A.y},
                   ${mx} ${B.y},
                   ${B.x} ${B.y}`
            );

            path.setAttribute(
                "class",
                "edge"
            );

            this.svg.appendChild(path);

            const text =
                this._el("text");

            text.setAttribute(
                "x",
                (A.x + B.x) / 2
            );

            text.setAttribute(
                "y",
                (A.y + B.y) / 2 - 8
            );

            text.setAttribute(
                "text-anchor",
                "middle"
            );

            text.setAttribute(
                "class",
                "badge"
            );

            text.textContent =
                edge.label;

            this.svg.appendChild(text);
        }
    }

    _drawNodes(nodes) {

        for (const node of nodes) {

            const width = 220;
            const height = 40;

            const g =
                this._el("g");

            const rect =
                this._el("rect");

            rect.setAttribute(
                "x",
                node.x - width / 2
            );

            rect.setAttribute(
                "y",
                node.y - height / 2
            );

            rect.setAttribute(
                "width",
                width
            );

            rect.setAttribute(
                "height",
                height
            );

            rect.setAttribute(
                "rx",
                10
            );

            rect.setAttribute(
                "ry",
                10
            );

            rect.setAttribute(
                "class",
                "node"
            );

            g.appendChild(rect);

            const text =
                this._el("text");

            text.setAttribute(
                "x",
                node.x
            );

            text.setAttribute(
                "y",
                node.y + 4
            );

            text.setAttribute(
                "text-anchor",
                "middle"
            );

            text.setAttribute(
                "class",
                "nodeText"
            );

            text.textContent =
                node.label;

            g.appendChild(text);

            this.svg.appendChild(g);
        }
    }

    _el(tag) {
        return document.createElementNS(
            "http://www.w3.org/2000/svg",
            tag
        );
    }
}