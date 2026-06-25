export default class InteractionMatrix {
    constructor(cases) {
        this.preprocess(cases);
        this.createLookups();
    }

    preprocess(cases) {
        const table = [];
        for (const c of cases.values.cases) {
            table.push(c.case.values);
        }
        this.table = table;
    }

    createLookups() {
        const userLookup = new Map();
        const itemLookup = new Map();

        for (const { User, Item, Rating } of this.table) {
            if (!userLookup.has(User)) userLookup.set(User, new Map());
            if (!itemLookup.has(Item)) itemLookup.set(Item, new Map());

            userLookup.get(User).set(Item, Rating);
            itemLookup.get(Item).set(User, Rating);
        }

        this.userLookup = userLookup;
        this.itemLookup = itemLookup;
    }

    getUsers() {
        const users = [];
        for (const { User } of this.table) {
            users.push(User);
        }
        return users;
    }

    getItems() {
        const items = [];
        for (const { Item } of this.table) {
            items.push(Item);
        }
        return items;
    }

    getUserVectors(userA, userB) {
        const ratingsA = this.userLookup.get(userA);
        const ratingsB = this.userLookup.get(userB);
        const common = this.getCommonRatings(ratingsA, ratingsB);
        return this.getRatingVectors(ratingsA, ratingsB, common);
    }

    getItemVectors(itemA, itemB) {
        const ratingsA = this.itemLookup.get(itemA);
        const ratingsB = this.itemLookup.get(itemB);
        const common = this.getCommonRatings(ratingsA, ratingsB);
        return this.getRatingVectors(ratingsA, ratingsB, common);
    }

    getCommonRatings(ratingsA, ratingsB) {
        const common = [];

        for (const user of ratingsA.keys()) {
            if (ratingsB.has(user)) {
                common.push(user);
            }
        }
        return common;
    }

    getRatingVectors(ratingsA, ratingsB, commonRatings) {
        const vecA = [];
        const vecB = [];
        
        for (const r of commonRatings) {
            vecA.push(ratingsA.get(r));
            vecB.push(ratingsB.get(r));
        }
        return [ vecA, vecB ];
    }


}