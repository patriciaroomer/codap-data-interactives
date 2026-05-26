export default class DecisionTree {
  
  constructor(mapping) {
    this.mapping = mapping;
    this.root = this.buildtree();
  }

  predict(row) {
    const parsed = this.parseRow(row);
    const leaf = this.walk(this.root, parsed);
    const rule = this.buildRule(this.root, parsed, []);
    return { pred: leaf.label, regel: rule };
  }

  tracePath(row) {
    const parsed = this.parseRow(row);
    const edges  = [];
    this.collectEdges(this.root, parsed, edges);
    const leaf = this.walk(this.root, parsed);
    return { edges, leaf: leaf.id };
  }

  buildtree() {
    return {
      id: 'm1',
      feature: 'Merkmal1',
      test: (v) => DecisionTree.bool(v),
      yes: { id: 'videospiel', label: 'Videospiel' },
      no: {
        id: 'm2',
        feature: 'Merkmal2',
        test: (v) => DecisionTree.bool(v),
        yes: { id: 'koop', label: 'Koop-Spiel' },
        no: {
          id: 'm4',
          feature: 'Merkmal4',
          test: (v) => DecisionTree.bool(v),
          yes: { id: 'karten', label: 'Kartenspiel' },
          no: {
            id: 'm3',
            feature: 'Merkmal3',
            test: (v) => DecisionTree.bool(v),
            yes: { id: 'strategie', label: 'Strategiespiel' },
            no: {
              id: 'm5',
              feature: 'Merkmal5',
              test: (v) => v !== null && v >= 5,
              yes: { id: 'party', label: 'Partyspiel' },
              no:  { id: 'unk',   label: 'Unbekannt'  },
            },
          },
        },
      },
    };
  }

  walk(node, parsed) {
    if (!node.feature) return node; // leaf
    const val    = parsed[node.feature];
    const branch = node.test(val) ? node.yes : node.no;
    return this.walk(branch, parsed);
  }

  collectEdges(node, parsed, acc) {
    if (!node.feature) return;
    const val    = parsed[node.feature];
    const taken  = node.test(val);
    acc.push(`${node.id}-${taken ? 'yes' : 'no'}`);
    this.collectEdges(taken ? node.yes : node.no, parsed, acc);
  }

  buildRule(node, parsed, parts) {
    if (!node.feature) {
      return parts.join(' → ') + ` → ${node.label}`;
    }
    const val   = parsed[node.feature];
    const taken = node.test(val);
    const lbl   = this.mapping.label(node.feature);
    const cond  = node.feature === 'Merkmal5'
      ? (taken ? `${lbl}≥5` : `${lbl}<5`)
      : (taken ? `${lbl}=ja` : `${lbl}=nein`);
    return this.buildRule(taken ? node.yes : node.no, parsed, [...parts, `Wenn ${cond}`]);
  }

  parseRow(row) {
    return {
      Merkmal1: DecisionTree.bool(row.Merkmal1),
      Merkmal2: DecisionTree.bool(row.Merkmal2),
      Merkmal3: DecisionTree.bool(row.Merkmal3),
      Merkmal4: DecisionTree.bool(row.Merkmal4),
      Merkmal5: DecisionTree.num(row.Merkmal5),
    };
  }

  static bool(v) {
    if (typeof v === 'boolean') return v;
    return ['true','wahr','ja','j','1','yes','y'].includes(
      String(v ?? '').trim().toLowerCase()
    );
  }

  static num(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
}