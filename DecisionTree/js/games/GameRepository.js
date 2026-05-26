import CODAPConnect from "../codap/CODAPConnect.js";

export default class GameRepository {
  static DC_NAME   = 'Spiele';
  static COLL_NAME = 'Spiele';

  static SCHEMA = {
    name: GameRepository.DC_NAME,
    title: 'Spiele (Klassifikation)',
    collections: [
      {
        name: GameRepository.COLL_NAME,
        title: 'Spiele',
        labels: { singleCase: 'Spiel', pluralCase: 'Spiele' },
        attrs: [
          { name: 'Name',        title: 'Name',                    type: 'categorical' },
          { name: 'Merkmal1',    title: 'Merkmal1',                type: 'categorical' },
          { name: 'Merkmal2',    title: 'Merkmal2',                type: 'categorical' },
          { name: 'Merkmal3',    title: 'Merkmal3',                type: 'categorical' },
          { name: 'Merkmal4',    title: 'Merkmal4',                type: 'categorical' },
          { name: 'Merkmal5',    title: 'Merkmal5',                type: 'numeric', precision: 0 },
          { name: 'Klasse',      title: 'Klasse (Label)',          type: 'categorical' },
          { name: 'Vorhersage',  title: 'Vorhersage (Baum)',       type: 'categorical' },
          { name: 'Regel',       title: 'Regel (welcher Ast)',     type: 'categorical' },
        ],
      },
    ],
  };

  static SAMPLE_ITEMS = [
    { Name: 'Minecraft',  Merkmal1: 'ja',   Merkmal2: 'nein', Merkmal3: 'ja',   Merkmal4: 'nein', Merkmal5: 1, Klasse: 'Videospiel'    },
    { Name: 'Mario Kart', Merkmal1: 'ja',   Merkmal2: 'nein', Merkmal3: 'nein', Merkmal4: 'nein', Merkmal5: 4, Klasse: 'Videospiel'    },
    { Name: 'Pandemic',   Merkmal1: 'nein', Merkmal2: 'ja',   Merkmal3: 'ja',   Merkmal4: 'nein', Merkmal5: 4, Klasse: 'Koop-Spiel'    },
    { Name: 'Schach',     Merkmal1: 'nein', Merkmal2: 'nein', Merkmal3: 'ja',   Merkmal4: 'nein', Merkmal5: 2, Klasse: 'Strategiespiel' },
    { Name: 'UNO',        Merkmal1: 'nein', Merkmal2: 'nein', Merkmal3: 'nein', Merkmal4: 'ja',   Merkmal5: 4, Klasse: 'Kartenspiel'   },
    { Name: 'Werwolf',    Merkmal1: 'nein', Merkmal2: 'nein', Merkmal3: 'nein', Merkmal4: 'nein', Merkmal5: 8, Klasse: 'Partyspiel'    },
  ];

  async findAll() {
    const response = await CODAPConnect.sendRequest({
    	action: 'get',
			resource: `dataContext[${GameRepository.DC_NAME}].itemSearch[*]`
    });
    return response.values ?? [];
  }

  async findById(id) {
    const items = await this.findAll();
    return items.find((it) => String(it.id) === String(id)) ?? null;
  }

  async insert(items) {
    const values = Array.isArray(items) ? items : [items];
		return CODAPConnect.sendRequest({
			action: "create",
			resource: `dataContext[${GameRepository.DC_NAME}].item`,
			values: values
		});
  }

  async updateMany(updates) {
		return CODAPConnect.sendRequest({
			action: "update",
			resource: `dataContext[${GameRepository.DC_NAME}].item`,
			values: updates
		});
  }
}