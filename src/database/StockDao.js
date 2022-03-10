module.exports = class StockDao {
    constructor(db) {
        this.col = db.collection('stocks');
        this.cache = new Map();
    }

    async insert(tickers) {
        return this.cached = await this.col.insertOne({ _id: 0, tickers });
    }

    async update(ticker, price) {
        return this.col.updateOne({ _id: 0 }, { $set: { [`tickers.${ticker}`]: price } }, { upsert: true });
    }

    async get() {
        return this.col.findOne({ _id: 0 });
    }

    async getCached() {
        if (this.cached) {
            return this.cached;
        }
        return this.cached = await this.get();
    }

    async getTickers() {
        return this.getCached()
            .then(data => data.tickers);
    }

    async getWorth(stock) {
        return this.getTickers()
            .then(tickers => tickers[stock]);
    }

    resetCache() {
        this.cached = null;
    }
};
