const Command = require("../util/classes/Command");
const embed = require("../util/functions/embed");
const { closePosition } = require("../util/functions/userData");
function round(x) {
	return Number.parseFloat(x).toFixed(2);
}

const command = new Command({
	name: "sell",
	description: "Sell shares of a specific stock",
	options: [
		{
			"type": 3,
			"name": "ticker",
			"description": "eg. AAPL",
			"required": true
		},
		{
			"type": 4,
			"name": "amount",
			"description": "amount of shares",
			"required": true
		},
	]
});

command.run = async function(client, interaction) {
	const input = interaction.options.getString("ticker");
	let amount = interaction.options.getInteger("amount");
	amount = Math.floor(amount);

	await interaction.reply("Attempting to place sell order...", { ephemeral: true });

	const response = await closePosition(client, interaction.user.id, input, amount);
	if (typeof response === "string") return interaction.followUp({ content: response, ephemeral: true });

	const { name, ticker, orderSize, costPerShare, totalCost, totalPosition, realized } = response;

	const e = embed({
		title: "Order Placed",
		description: `You now own **${totalPosition}** shares of ${name} (${ticker}). View your complete portfolio by doing \`/portfolio\`.`,
		fields: [
			{ name: ticker, value: `\`Sell\` **${orderSize}** shares @ $${round(costPerShare)} ($${round(totalCost)} total)` },
			{ name: "Realized  P/L", value: `${realized > 0 ? "<:green:950168745333116958>" : "<:red:950168770784133170>"} $${round(realized)}` }
		]
	});

	return interaction.followUp({ embeds: [e] });
}

module.exports = command;