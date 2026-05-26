import CODAPConnect from "../codap/CODAPConnect.js";
import DecisionTree from "./DecisionTree.js";

export default class FeatureMapping {
  static KEYS = ['Merkmal1', 'Merkmal2', 'Merkmal3', 'Merkmal4', 'Merkmal5'];
  static DC_NAME = 'Merkmale';
  static COLL_NAME = 'Merkmale';

  static SCHEMA = {
    name: 'Merkmale',
    title: 'Merkmale (Meta)',
    collections: [
      {
        name: 'Merkmale',
        title: 'Merkmale',
        labels: { singleCase: 'Merkmal', pluralCase: 'Merkmale' },
        attrs: [
          { name: 'Key',          title: 'Key (Merkmal1..)', type: 'categorical' },
          { name: 'Label',        title: 'Anzeigename',      type: 'categorical' },
          { name: 'Beschreibung', title: 'Beschreibung',     type: 'categorical' },
          { name: 'Typ',          title: 'Typ (ja/nein / Zahl)', type: 'categorical' },
        ],
      },
    ],
  };

  static SAMPLE_ITEMS = [
    { Key: 'Merkmal1', Label: 'Digital',     Beschreibung: 'Ist es ein digitales Spiel?',     Typ: 'ja/nein' },
    { Key: 'Merkmal2', Label: 'Kooperativ',  Beschreibung: 'Spielt man im Team gegen das Spiel?', Typ: 'ja/nein' },
    { Key: 'Merkmal3', Label: 'Strategie',   Beschreibung: 'Braucht man Planung/Taktik?',     Typ: 'ja/nein' },
    { Key: 'Merkmal4', Label: 'Kartenspiel', Beschreibung: 'Ist es primär mit Karten?',       Typ: 'ja/nein' },
    { Key: 'Merkmal5', Label: 'Spielerzahl', Beschreibung: 'Typische Spielerzahl',            Typ: 'Zahl'    },
  ];

  constructor() {
    this.labels = Object.fromEntries(FeatureMapping.KEYS.map((k) => [k, k]));
  }

  async load() {
		const response = await CODAPConnect.sendRequest({ 
			action: "get", 
			resource: `dataContext[${FeatureMapping.DC_NAME}].itemSearch[*]` 
		});
    const items = response.values ?? [];

    const updated = Object.fromEntries(FeatureMapping.KEYS.map((k) => [k, k]));
    for (const it of items) {
      const v = it.values ?? {};
      const key   = String(v.Key   ?? '').trim();
      const label = String(v.Label ?? '').trim();
      if (FeatureMapping.KEYS.includes(key) && label) updated[key] = label;
    }
    this.labels = updated;
  }

  label(key) {
    return this.labels[key] ?? key;
  }

  getAll() {
    return { ...this.labels };
  }

  async applyTitlesToGameContext(gamesDataContext, gamesColl) {
    for (const key of FeatureMapping.KEYS) {
      try {
        await CODAPConnect.sendRequest({
          action: "update",
          resource: `dataContext[${gamesDataContext}].collection[${gamesColl}].attribute[${key}]`,
          values: {
            title: this.label(key)
          }
        });
      } catch (_) {
        // Best-effort: silently ignore if CODAP version doesn't support this
      }
    }
  }
}