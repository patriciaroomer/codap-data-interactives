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

    getRatings(user) {
        const ratings = new Map();
        for (const e of this.entries) {
            if (e.User != user) continue;
            ratings.set(e.Item, e.Rating);
        }
        return ratings;
    }
}