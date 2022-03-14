const lookup = require("./lookup");
const { getContract } = require("./ameritrade");

let currentLeaderboard = [];

function round(x) {
    return parseInt(Number.parseFloat(x).toFixed(2));
}

async function addOption(client, account, userId, input, date, type, strike, amount) {
    const data = await getContract(input, date, type, strike);
    if (typeof data === "string") return data;

    const { symbol, underlying, description, bidPrice, bidSize, askPrice, askSize, lastPrice, totalVolume, delta, gamma, theta, vega, rho} = data;
    const userData = await client.userDao.get(userId);
    const userOptions = userData[account].options || {};
    const userCash = userData[account].stocks["$CASH"].amount;

    const costBasis = round((askPrice * 100) * amount);
    if (costBasis > userCash) return `Not enough cash to complete this order. You need $${round(costBasis - userCash)} more.`;

    if (userOptions[symbol]) {
        const prevAmount = userOptions[symbol].amount;
        const prevAverage = userOptions[symbol].average * 100;

        let newAmount = amount + prevAmount;
        let newAverage = round(askPrice * 100);

        if (prevAmount > 0 && (askPrice * 100) !== prevAverage) {
            let prevCost = prevAverage * prevAmount;
            let newCost = (askPrice * 100) * amount;

            newAverage = (prevCost + newCost) / (newAmount);
            newAverage = round(newAverage);
        }

        await client.userDao.addOption(userId, symbol, description, parseInt(newAmount), newAverage, null, account);
        await client.userDao.addStock(userId, "$CASH", round(userCash - costBasis), 1, null, account);

        return { name: description, symbol, orderSize: amount, costPerShare: askPrice * 100, totalCost: costBasis, totalPosition: newAmount, newBalance: round(userCash - costBasis) };
    } else {
        await client.userDao.addOption(userId, symbol, description, parseInt(amount), askPrice * 100, null, account);
        await client.userDao.addStock(userId, "$CASH", round(userCash - costBasis), 1, null, account);

        return { name: description, symbol, orderSize: amount, costPerShare: askPrice * 100, totalCost: costBasis, totalPosition: amount, newBalance: round(userCash - costBasis) };
    }
}

async function closeOption(client, account, userId, input, date, type, strike, amount) {
    const data = await getContract(input, date, type, strike);
    const userData = await client.userDao.get(userId);
    const userOptions = userData[account].options;
    const userPos = userOptions[`${input.toUpperCase()}_${date}${type}${strike}`];

    if (typeof data === "string" && userPos && userPos.amount > 0) {
        await client.userDao.addOption(userId, `${input.toUpperCase()}_${date}${type}${strike}`, 0, 0, null, null, account);
        return "The specified contracts have expired and are worthless.";
    }

    if (typeof data === "string") return data;

    const { symbol, underlying, description, bidPrice, bidSize, askPrice, askSize, lastPrice, totalVolume, delta, gamma, theta, vega, rho } = data;
    const userCash = userData[account].stocks["$CASH"].amount;

    const curPosition = userOptions[symbol];
    if (amount > curPosition.amount) return `You cannot sell more contracts than you own. You own ${curPosition.amount} contracts.`;
    if (!curPosition) return "You do not own this contract.";

    const prevRealized = curPosition?.realized || 0;
    const realized = round((((askPrice * 100) * amount) - (curPosition.average * amount)) + (!isNaN(prevRealized) ? prevRealized : 0));

    const totalValue = round((askPrice * 100) * amount);

    if ((curPosition.amount - amount) < 1) {
        await client.userDao.addOption(userId, symbol, description, 0, 0, realized, account);
        await client.userDao.addStock(userId, "$CASH", userCash + totalValue, 1, null, account);

        return { name: description, symbol, orderSize: amount, costPerShare: (askPrice * 100), totalCost: totalValue, totalPosition: 0, realized: realized };
    } else {
        await client.userDao.addOption(userId, symbol, description, curPosition.amount - amount, parseInt(curPosition.average), realized, account);
        await client.userDao.addStock(userId, "$CASH", userCash + totalValue, 1, null, account);

        return { name: description, symbol, orderSize: amount, costPerShare: (askPrice * 100), totalCost: totalValue, totalPosition: curPosition.amount - amount, realized: realized };
    }
}

async function addPosition(client, account, userId, input, amount) {
    const data = await lookup(input);
    if (!data) return "An error occurred while attempting to fetch stock information. Did you input a valid ticker?";

    const { name, ticker, price } = data;
    const userData = await client.userDao.get(userId);
    const userStocks = userData[account].stocks;
    const userCash = userData[account].stocks["$CASH"].amount;

    const costBasis = round(price * amount);
    if (costBasis > userCash) return `Not enough cash to complete this order. You need $${round(costBasis - userCash)} more.`;

    if (userStocks[ticker]) {
        const prevAmount = userStocks[ticker].amount;
        const prevAverage = userStocks[ticker].average;

        let newAmount = amount + prevAmount;
        let newAverage = round(price);

        if (prevAmount > 0 && price !== prevAverage) {
            let prevCost = prevAverage * prevAmount;
            let newCost = price * amount;

            newAverage = (prevCost + newCost) / (newAmount);
            newAverage = round(newAverage);
        }

        await client.userDao.addStock(userId, ticker, parseInt(newAmount), newAverage, null, account);
        await client.userDao.addStock(userId, "$CASH", round(userCash - costBasis), 1, null, account);

        return { name, ticker, orderSize: amount, costPerShare: price, totalCost: costBasis, totalPosition: newAmount, newBalance: round(userCash - costBasis) };
    } else {
        await client.userDao.addStock(userId, ticker, parseInt(amount), price, null, account);
        await client.userDao.addStock(userId, "$CASH", round(userCash - costBasis), 1, null, account);

        return { name, ticker, orderSize: amount, costPerShare: price, totalCost: costBasis, totalPosition: amount, newBalance: round(userCash - costBasis) };
    }
}

async function closePosition(client, account, userId, input, amount) {
    const data = await lookup(input);
    if (!data) return "An error occurred while attempting to fetch stock information. Did you input a valid ticker?";

    const { name, ticker, price } = data;
    const userData = await client.userDao.get(userId);
    const userStocks = userData[account].stocks;
    const userCash = userData[account].stocks["$CASH"].amount;

    const curPosition = userStocks[ticker];
    if (amount > curPosition.amount) return `You cannot sell more shares than you own. You own ${curPosition.amount} shares.`;
    if (!curPosition) return "You do not own this security.";

    const prevRealized = curPosition?.realized || 0;
    const realized = round(((price * amount) - (curPosition.average * amount)) + (!isNaN(prevRealized) ? prevRealized : 0));

    const totalValue = round(price * amount);

    if ((curPosition.amount - amount) < 1) {
        await client.userDao.addStock(userId, ticker, 0, 0, realized, account);
        await client.userDao.addStock(userId, "$CASH", userCash + totalValue, 1, null, account);

        return { name, ticker, orderSize: amount, costPerShare: price, totalCost: totalValue, totalPosition: 0, realized: realized };
    } else {
        await client.userDao.addStock(userId, ticker, curPosition.amount - amount, parseInt(curPosition.average), realized, account);
        await client.userDao.addStock(userId, "$CASH", userCash + totalValue, 1, null, account);

        return { name, ticker, orderSize: amount, costPerShare: price, totalCost: totalValue, totalPosition: curPosition.amount - amount, realized: realized };
    }
}

async function calculateValue(client, userId, account = "primary") {
    const userData = await client.userDao.get(userId);

    const userStocks = userData[account].stocks;
    const userOptions = userData[account].options;
    const userCash = userData[account].stocks["$CASH"].amount;
    let totalValue = parseInt(userCash);

    if (userStocks) {
        for (const [name, { amount }] of Object.entries(userStocks)) {
            if (name === "$CASH") continue;

            let price = null;

            if (!price) {
                const data = await lookup(name);
                if (data) price = data.price;
                if (!price) continue;
            }

            totalValue += parseInt(round(amount * price));
        }
    }

    if (userOptions) {
        for (const [name, { amount }] of Object.entries(userOptions)) {
            let price = null;

            if (!price) {
                const data = await getContract(name);
                if (data) price = data["askPrice"];
                if (!price) continue;
            }

            totalValue += parseInt(round(amount * (price * 100)));
        }
    }

    return round(totalValue);
}

async function updateValues(client, account = "primary") {
    const allUsers = await client.userDao.find({});

    for (const { _id } of allUsers) {
        const newValue = await calculateValue(client, _id);
        await client.userDao.addHistory(_id, newValue, account);
        await client.userDao.setValue(_id, account, newValue);
    }
}

async function updateLeaderboard(client) {
    const cursor = await client.userDao.getCursor({});
    const result = await cursor
        .sort({ [`primary.value`]: 1 })
        .limit(10)
        .toArray();

    currentLeaderboard = result;
}

function getLeaderboard() {
    return currentLeaderboard;
}

module.exports = { addPosition, closePosition, calculateValue, updateValues, addOption, closeOption, updateLeaderboard, getLeaderboard }
