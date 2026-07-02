export default class Data {
    constructor() {
        this.attributes = [];
        this.entries = [];
    }

    getUsers() {
        const users = [];
        for (const e of this.entries) {
            if (!users.includes(e.User)) 
                users.push(e.User);
        }
        return users;
    }

    getItems() {
        const items = new Set();
        for (const row of this.entries) {
            items.add(row.Item);
        }
        return items;
    }

    getRatings(user) {
        const ratings = new Map();
        for (const e of this.entries) {
            if (e.User != user) continue;
            ratings.set(e.Item, e.Rating);
        }
        return ratings;
    }
}