const Command = require("../util/classes/Command");
const embed = require("../util/functions/embed");
const { addPosition } = require("../util/functions/userData");
function round(x) {
	return Number.parseFloat(x).toFixed(2);
}

const command = new Command({
	name: "buy",
	description: "Buy shares of a specific stock",
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

	await interaction.reply("Attempting to place buy order...", { ephemeral: true });

	const response = await addPosition(client, interaction.user.id, input, amount);
	if (typeof response === "string") return interaction.followUp({ content: response, ephemeral: true });

	const { name, ticker, orderSize, costPerShare, totalCost, totalPosition, newBalance } = response;

	const e = embed({
		title: "Order Placed",
		description: `You now own **${totalPosition}** shares of ${name} (${ticker}). Cash balance is now $${round(newBalance)}. View your complete portfolio by doing \`/portfolio\`.`,
		fields: [
			{ name: ticker, value: `\`Buy\` **${orderSize}** shares @ $${round(costPerShare)} ($${round(totalCost)} total)` }
		]
	});

	return interaction.followUp({ embeds: [e] });
}

module.exports = command;