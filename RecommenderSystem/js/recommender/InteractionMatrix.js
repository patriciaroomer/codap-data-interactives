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
            if (users.includes(User)) continue;
            users.push(User);
        }
        return users;
    }

    getItems() {
        const items = [];
        for (const { Item } of this.table) {
            if (items.includes(Item)) continue;
            items.push(Item);
        }
        return items;
    }

    getUserRating(u) {
        return this.userLookup.get(u);
    }

    getUserRatings(userA, userB) {
        const ratingsA = this.userLookup.get(userA);
        const ratingsB = this.userLookup.get(userB);

        const common = this.getCommonRatings(ratingsA, ratingsB);
        return this.getRatingVectors(ratingsA, ratingsB, common);
    }

    getItemRatings(itemA, itemB) {
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

    getRatingVector(u) {
        const rating = [];
        const userRating = this.getUserRating(u);
        for (const r of userRating) {
            rating.push(r[1]);
        }
        return rating;
    }

    getRatingVectors(ratingsA, ratingsB, commonRatings) {
        const r1 = [];
        const r2 = [];
        
        for (const r of commonRatings) {
            r1.push(ratingsA.get(r));
            r2.push(ratingsB.get(r));
        }
        return [ r1, r2 ];
    }


}