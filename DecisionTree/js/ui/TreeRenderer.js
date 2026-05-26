export default class TreeRenderer {
  static LAYOUT = {
    m1:         { x: 460, y:  32, w: 230, h: 40 },

    videospiel: { x: 210, y: 110, w: 170, h: 40 },
    m2:         { x: 700, y: 110, w: 240, h: 40 },

    koop:       { x: 580, y: 190, w: 170, h: 40 },
    m4:         { x: 810, y: 190, w: 240, h: 40 },

    karten:     { x: 700, y: 270, w: 170, h: 40 },
    m3:         { x: 560, y: 270, w: 160, h: 40 },

    strategie:  { x: 480, y: 270, w: 180, h: 40 },
    m5:         { x: 820, y: 270, w: 240, h: 40 },

    party:      { x: 755, y: 270, w: 150, h: 40 },
    unk:        { x: 895, y: 270, w: 150, h: 40 },
  };

  static {
    const L = TreeRenderer.LAYOUT;
    L.m1         = { x: 460, y:  30, w: 230, h: 38 };
    L.videospiel = { x: 165, y: 110, w: 175, h: 38 };
    L.m2         = { x: 690, y: 110, w: 245, h: 38 };
    L.koop       = { x: 560, y: 190, w: 170, h: 38 };
    L.m4         = { x: 800, y: 190, w: 240, h: 38 };
    L.karten     = { x: 690, y: 270, w: 170, h: 38 };
    L.m3         = { x: 530, y: 270, w: 170, h: 38 };
    L.strategie  = { x: 440, y: 270, w: 175, h: 38 };
    L.m5         = { x: 820, y: 270, w: 235, h: 38 };
    L.party      = { x: 740, y: 270, w: 150, h: 38 };
    L.unk        = { x: 900, y: 270, w: 150, h: 38 };
  }

  static EDGES = [
    { id: 'm1-yes',  from: 'm1', to: 'videospiel', label: 'ja'   },
    { id: 'm1-no',   from: 'm1', to: 'm2',         label: 'nein' },
    { id: 'm2-yes',  from: 'm2', to: 'koop',       label: 'ja'   },
    { id: 'm2-no',   from: 'm2', to: 'm4',         label: 'nein' },
    { id: 'm4-yes',  from: 'm4', to: 'karten',     label: 'ja'   },
    { id: 'm4-no',   from: 'm4', to: 'm3',         label: 'nein' },
    { id: 'm3-yes',  from: 'm3', to: 'strategie',  label: 'ja'   },
    { id: 'm3-no',   from: 'm3', to: 'm5',         label: 'nein' },
    { id: 'm5-yes',  from: 'm5', to: 'party',      label: 'ja'   },
    { id: 'm5-no',   from: 'm5', to: 'unk',        label: 'nein' },
  ];

  constructor(svgEl, infoEl, mapping) {
    this.svg     = svgEl;
    this.info    = infoEl;
    this.mapping = mapping;
  }

  render(activeEdges = [], activeLeafId = null) {
    this.svg.innerHTML = '';
    this._drawEdges(activeEdges);
    this._drawNodes(activeLeafId);

    const labels = this._nodeLabels();
    this.info.textContent = activeLeafId
      ? `Aktiver Pfad endet bei: ${labels[activeLeafId] ?? activeLeafId}`
      : 'Kein Pfad markiert (wähle ein Spiel oben).';
  }
  
  _nodeLabels() {
    const m = this.mapping;
    return {
      m1:         `${m.label('Merkmal1')}?`,
      m2:         `${m.label('Merkmal2')}?`,
      m4:         `${m.label('Merkmal4')}?`,
      m3:         `${m.label('Merkmal3')}?`,
      m5:         `${m.label('Merkmal5')} ≥ 5?`,
      videospiel: '→ Videospiel',
      koop:       '→ Koop-Spiel',
      karten:     '→ Kartenspiel',
      strategie:  '→ Strategiespiel',
      party:      '→ Partyspiel',
      unk:        '→ Unbekannt',
    };
  }

  _drawEdges(activeEdges) {
    for (const e of TreeRenderer.EDGES) {
      const A = TreeRenderer.LAYOUT[e.from];
      const B = TreeRenderer.LAYOUT[e.to];
      if (!A || !B) continue;

      const p1 = { x: A.x, y: A.y + A.h / 2 };
      const p2 = { x: B.x, y: B.y - B.h / 2 };
      const mx = (p1.x + p2.x) / 2;

      const path = this._el('path');
      path.setAttribute('d', `M ${p1.x} ${p1.y} C ${mx} ${p1.y}, ${mx} ${p2.y}, ${p2.x} ${p2.y}`);
      path.setAttribute('class', 'edge' + (activeEdges.includes(e.id) ? ' edgeActive' : ''));
      this.svg.appendChild(path);

      const t = this._el('text');
      t.setAttribute('x', (p1.x + p2.x) / 2);
      t.setAttribute('y', (p1.y + p2.y) / 2 - 6);
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('class', 'badge');
      t.textContent = e.label;
      this.svg.appendChild(t);
    }
  }

  _drawNodes(activeLeafId) {
    const labels = this._nodeLabels();
    for (const [id, lbl] of Object.entries(labels)) {
      const Lc = TreeRenderer.LAYOUT[id];
      if (!Lc) continue;

      const g    = this._el('g');
      const rect = this._el('rect');
      rect.setAttribute('x', Lc.x - Lc.w / 2);
      rect.setAttribute('y', Lc.y - Lc.h / 2);
      rect.setAttribute('rx', 10);
      rect.setAttribute('ry', 10);
      rect.setAttribute('width',  Lc.w);
      rect.setAttribute('height', Lc.h);
      rect.setAttribute('class', 'node' + (activeLeafId === id ? ' nodeActive' : ''));
      g.appendChild(rect);

      const text = this._el('text');
      text.setAttribute('x', Lc.x);
      text.setAttribute('y', Lc.y + 4);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('class', 'nodeText');
      text.textContent = lbl;
      g.appendChild(text);

      this.svg.appendChild(g);
    }
  }

  _el(tag) {
    return document.createElementNS('http://www.w3.org/2000/svg', tag);
  }
}