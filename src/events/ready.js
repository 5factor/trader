const { updateValues, updateLeaderboard } = require("../util/functions/userData");

module.exports = async function (client) {
    console.log(`Logged in as ${client.user.tag} (${client.user.id})`);

    await client.user.setActivity("the NASDAQ", {
        type: "WATCHING",
    });

    await updateValues(client);
    await updateLeaderboard(client);
    setInterval(async () => await updateValues(client), 900_000);
    setInterval(async () => await updateLeaderboard(client), 900_000);
};