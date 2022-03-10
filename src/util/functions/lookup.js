const finviz = require("finvizor");

module.exports = async function (input) {
    let stock = await finviz.stock(input)
        .catch((e) => {
            return;
        });
    if (!stock) return;

    return stock;
}