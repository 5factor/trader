module.exports = class UserDao {
    constructor(db) {
        this.col = db.collection('users');
        this.cache = new Map();
    }

    async create(id) {
        return this.insert({
            _id: id,
            value: 0,
            stocks: { $CASH: { amount: 100_000, average: 1 } },
            options: {},
            history: []
        });
    }

    async update(_id, data = {}) {
        const set = { $set: data };
        const opts = { upsert: true, $setOnInsert: { _id } };
        const { value } = await this.col.findOneAndUpdate(this.queryOf(_id), set, opts) || {};
        return value;
    }

    async getCursor(filter = {}) {
        const cursor = await this.col.find(filter);
        return cursor;
    }

    async find(filter = {}) {
        const cursor = await this.col.find(filter);
        return cursor.toArray();
    }

    async insert(user) {
        const result = await this.col.insertOne(user);
        this.cache.set(user._id, user);
        return result;
    }

    async get(id) {
        return this.col.findOne({ _id: id });
    }

    async getCached(id) {
        if (this.cache.has(id)) {
            return this.cache.get(id);
        }
        const user = await this.get(id);
        this.cache.set(user._id, user);
        return user;
    }

    async getValue(id) {
        return this.getCached(id)
            .then(user => user.value);
    }

    async setValue(id, value) {
        return this.col.updateOne({ _id: id }, { $set: { value } });
    }

    async getStocks(id) {
        return this.getCached(id)
            .then(user => user.stocks);
    }

    async addOption(id, ticker, description, amount, average, realized) {
        return this.col.updateOne({ _id: id }, { $set: { [`options.${ticker}`]: { amount: amount, description: description, average: average, realized: realized } } });
    }

    async addStock(id, ticker, amount, average, realized) {
        return this.col.updateOne({ _id: id }, { $set: { [`stocks.${ticker}`]: { amount: amount, average: average, realized: realized } } });
    }

    async setStocks(id, stocks) {
        return this.col.updateOne({ _id: id }, { stocks });
    }

    async getHistory(id) {
        return this.getCached(id)
            .then(user => user.history);
    }

    async setHistory(id, history) {
        return this.col.updateOne({ _id: id }, { $set: { history } });
    }

    async addHistory(id, value) {
        let history = await this.getHistory(id);
        history.unshift(value);
        if (history.length > 96) { // 24H / 15M = 96 units
            history = history.slice(0, 96);
        }
        return this.setHistory(id, history);
    }

    resetCache() {
        this.cache = new Map();
    }

    queryOf(input = {}) {
        if (Array.isArray(input)) {
            return input.map(this.queryOf);
        }
        if (typeof input !== 'object') {
            return { _id: input };
        }
        return input;
    }
};
