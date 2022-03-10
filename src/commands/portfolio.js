const Command = require("../util/classes/Command");
const embed = require("../util/functions/embed");
const { calculateValue } = require("../util/functions/userData");
const { getContract } = require("../util/functions/ameritrade");
const lookup = require("../util/functions/lookup");
function round(x) {
    return Number.parseFloat(x).toFixed(2);
}

const command = new Command({
    name: "portfolio",
    description: "View your portfolio",
    options: [
        {
            "type": 5,
            "name": "expanded",
            "description": "view expanded portfolio",
            "required": false
        }
    ]
});

command.run = async function (client, interaction) {
    const expanded = interaction.options.getBoolean("expanded");

    await interaction.reply("Attempting to retrieve information...", { ephemeral: true });

    const userData = await client.userDao.get(interaction.user.id);
    const totalValue = await calculateValue(client, interaction.user.id);

    const userCash = userData.stocks["$CASH"].amount;
    const userStocks = userData.stocks;
    const userOptions = userData.options;
	const history = userData.history;

	const [profit, percentage] = [round(totalValue - 100_000), round(((totalValue - 100_000) / 100_000) * 100)];
	let [dayProfit, dayPercentage] = ["NA", "NA"];

	if (history) {
		const dayAgo = history[history.length - 1];
		[dayProfit, dayPercentage] = [round(totalValue - dayAgo), round(((totalValue - dayAgo) / dayAgo) * 100)];
	}

    let positions = ""

    if (userStocks) {
        for (const [name, { amount, average }] of Object.entries(userStocks)) {
            if (amount < 1) continue;

            let price = null

            if (!price) {
                const data = await lookup(name);
                if (data) price = data.price;
                if (!price) continue;
            }

            const gain = ((price * amount) - (average * amount));

            const newString =
                `*${name}:*\n` +
                `↳ Current price: $${price}\n` +
                `↳ ${amount} shares @ $${average}\n` +
                `↳ P/L: $${round(gain)}\n\n`;

            positions += newString;
        }
    }

    if (userOptions) {
        for (const [name, { description, amount, average }] of Object.entries(userOptions)) {
            if (amount < 1) continue;

            let price = null

            if (!price) {
                const data = await getContract(name);
                if (data) price = data["askPrice"];
                if (!price) continue;
            }

            const gain = (((price * 100) * amount) - (average * amount));

            const newString =
                `*${description}:*\n` +
                `↳ Current price: ${price}\n` +
                `↳ ${amount} contracts @ $${round(average / 100)}\n` +
                `↳ P/L: $${round(gain)}\n\n`;

            positions += newString;
        }
    }

    const short = embed({
        title: `${interaction.user.tag}'s Portfolio`,
        description:
			`💸 **Account Value:** $${totalValue}\n` +
            `💵 **Cash Balance:** $${userCash}\n\n` +
			`📈 **All-time P/L:** ${percentage}% ($${profit})\n` +
			`⏲️ **24H Change:** ${dayPercentage}% ($${dayProfit})\n\n` +
			`View your extended portfolio by doing \`/portfolio true\``,
		timestamp: true
    });

    const full = embed({
        title: `${interaction.user.tag}'s Portfolio`,
        description:
            `💸 **Account Value:** $${totalValue}\n` +
            `💵 **Cash Balance:** $${userCash}\n\n` +
            `📈 **All-time P/L:** ${percentage}% ($${profit})\n` +
            `⏲️ **24H Change:** ${dayPercentage}% ($${dayProfit})\n\n` +
            `**Open Positions:**\n` +
            positions,
        timestamp: true
    });

    if (expanded) return interaction.followUp({ embeds: [full] });
    return interaction.followUp({ embeds: [short] });
}

module.exports = command;
