export default class TreeLayout {

    static generate(root) {

        const nodes = [];
        const edges = [];

        let nextLeafX = 100;

        function visit(node, depth = 0) {

            if (node.type === "leaf") {

                const x = nextLeafX;
                const y = 80 + depth * 120;

                nextLeafX += 180;

                nodes.push({
                    x,
                    y,
                    label: `→ ${node.class}`,
                    node
                });

                return { x, y };
            }

            const childPositions = [];
            const childEdges = [];

            for (const [value, child] of Object.entries(node.children)) {

                const childPos =
                    visit(child, depth + 1);

                childPositions.push(childPos);
                childEdges.push({ to: childPos, label: value, childNode: child });
            }

            const x =
                childPositions.reduce(
                    (sum, p) => sum + p.x,
                    0
                ) / childPositions.length;

            const y = 80 + depth * 120;
            const pos = { x, y };

            nodes.push({
                x,
                y,
                label: `${node.attribute}?`,
                node
            });

            for (const edge of childEdges) {
                edges.push({ from: pos, to: edge.to, label: edge.label, fromNode: node, toNode: edge.childNode });
            }

            return pos;
        }

        visit(root);

        return {
            nodes,
            edges
        };
    }
}