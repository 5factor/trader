const { TDAmeritrade } = require("@knicola/tdameritrade");

const td = new TDAmeritrade({
    apiKey: process.env.AMERITRADE,
    redirectUri: 'https://localhost:8443'
});

async function getContract(symbol, date, type, strike) {
    const key = (symbol.length > 9) ? symbol : `${symbol}_${date}${type}${strike}`;
    let data = await td.getQuote(key);

    if (Object.values(data)[0].description === "Symbol not found") return "Unable to find this contract.";

    return Object.values(data)[0]; // { description, bidPrice, bidSize, askPrice, askSize, totalVolume, strikePrice, delta, gamma, theta, vega, rho}
}

async function getTicker(symbol) {
    const data = await td.getQuote(symbol);
    if (Object.values(data)[0].description === "Symbol not found") return "Unable to find this ticker.";

    return Object.values(data)[0]; // { description, lastPrice, netChange, totalVolume, divAmount, exchangeName, 52WkHigh, 52WkLow }
}

module.exports = { getContract, getTicker }