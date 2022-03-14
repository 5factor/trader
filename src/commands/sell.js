const { closePosition, closeOption } = require("../util/functions/userData");
const { exchange } = require("trading-calendar");

const Command = require("../util/classes/Command");
const embed = require("../util/functions/embed");
const ny = exchange("new-york");

const command = new Command({
	name: "sell",
	description: "Sell a specific stock or option",
	options: [
		{
			"name": "stock",
			"description": "Trade a stock",
			"type": 1,
			"options": [
				{
					"type": 3,
					"name": "account",
					"description": "Main account or custom account",
					"choices": [{ name: "Main Account", value: "primary" }, { name: "Custom Account", value: "secondary" }],
					"required": true
				},
				{
					"type": 3,
					"name": "ticker",
					"description": "eg. AAPL",
					"required": true
				},
				{
					"type": 4,
					"name": "amount",
					"description": "Amount of shares",
					"required": true
				}
			]
		},
		{
			"name": "option",
			"description": "Trade a option",
			"type": 1,
			"options": [
				{
					"type": 3,
					"name": "account",
					"description": "Main account or custom account",
					"choices": [{ name: "Main Account", value: "primary" }, { name: "Custom Account", value: "secondary" }],
					"required": true
				},
				{
					"type": 3,
					"name": "ticker",
					"description": "eg. AAPL",
					"required": true
				},
				{
					"type": 3,
					"name": "type",
					"description": "Call/Put",
					"choices": [{ name: "Call", value: "C" }, { name: "Put", value: "P" }],
					"required": true
				},
				{
					"type": 4,
					"name": "strike",
					"description": "eg. 200",
					"required": true
				},
				{
					"type": 3,
					"name": "month",
					"description": "Month",
					"choices": [{ name: "01 - January", value: "01" }, { name: "02 - February", value: "02" }, { name: "03 - March", value: "03" }, { name: "04 - April", value: "04" }, { name: "05 - May", value: "05" }, { name: "06 - June", value: "06" }, { name: "07 - July", value: "07" }, { name: "08 - August", value: "08" }, { name: "09 - September", value: "09" }, { name: "10 - October", value: "10" }, { name: "11 - November", value: "11" }, { name: "12 - December", value: "12" }],
					"required": true
				},
				{
					"type": 4,
					"name": "day",
					"description": "eg. 01",
					"required": true
				},
				{
					"type": 3,
					"name": "year",
					"description": "Year",
					"choices": [{ name: "2022", value: "22" }, { name: "2023", value: "23" }, { name: "2024", value: "24" }, { name: "2025", value: "25" }],
					"required": true
				},
				{
					"type": 4,
					"name": "amount",
					"description": "Amount of contracts",
					"required": true
				}
			]
		},
	]
});

command.run = async function(client, interaction) {
	const subcommand = interaction.options.getSubcommand(true);

	const account = interaction.options.getString("account");
	const input = interaction.options.getString("ticker");
	let amount = interaction.options.getInteger("amount");
	amount = Math.floor(amount);

	const type = interaction.options.getString("type");
	const strike = interaction.options.getInteger("strike");
	const month = interaction.options.getString("month");
	const year = interaction.options.getString("year");
	let day = interaction.options.getInteger("day");

	await interaction.reply({ content: "Processing your order, this shouldn't take more than a few seconds", ephemeral: true });

	switch (subcommand) {
		case "stock": {
			const response = await closePosition(
				client,
				account,
				interaction.user.id,
				input,
				amount
			);

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

		case "option": {
			if (!ny.isTradingNow()) return interaction.reply({ content: "Options can only be traded while the NYSE is open.", ephemeral: true });

			if (day.toString().length === 1) day = `0${day}`;

			const data = await closeOption(
				client,
				account,
				interaction.user.id,
				input,
				`${month}${day}${year}`,
				type,
				strike.toString(),
				amount
			);

			if (typeof data === "string") return interaction.followUp({ content: data, ephemeral: true });

			const { name, symbol, orderSize, costPerShare, totalCost, totalPosition, realized } = data;

			const e = embed({
				title: "Order Placed",
				description: `You now own **${totalPosition}** ${name}. View your complete portfolio by doing \`/portfolio\`.`,
				fields: [
					{ name: symbol, value: `\`Sell\` **${orderSize}** contracts @ $${round(costPerShare)} ($${round(totalCost)} total)` },
					{ name: "Realized  P/L", value: `${realized > 0 ? "<:green:950168745333116958>" : "<:red:950168770784133170>"} $${round(realized)}` }
				]
			});

			return interaction.followUp({ embeds: [e] });
		}
	}
}

function round(x) {
	return Number.parseFloat(x).toFixed(2);
}

module.exports = command;