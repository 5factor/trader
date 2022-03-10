const Command = require("../util/classes/Command");
const embed = require("../util/functions/embed");
const { closeOption } = require("../util/functions/userData");
function round(x) {
	return Number.parseFloat(x).toFixed(2);
}

const { exchange } = require("trading-calendar");
const ny = exchange("new-york");


const command = new Command({
	name: "selloption",
	description: "Sell a option contract",
	options: [
		{
			"type": 3,
			"name": "ticker",
			"description": "eg. AAPL",
			"required": true
		},
		{
			"type": 3,
			"name": "type",
			"description": "call/put",
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
			"description": "month",
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
			"description": "year",
			"choices": [{ name: "2022", value: "22" }, { name: "2023", value: "23" }, { name: "2024", value: "24" }, { name: "2025", value: "25" }],
			"required": true
		},
		{
			"type": 4,
			"name": "amount",
			"description": "amount of contracts",
			"required": true
		},
	]
});

command.run = async function(client, interaction) {
	if (!ny.isTradingNow()) return interaction.reply({ content: "You cannot trade options after hours.", ephemeral: true });

	const input = interaction.options.getString("ticker");
	const type = interaction.options.getString("type");
	const strike = interaction.options.getInteger("strike");
	const month = interaction.options.getString("month");
	let day = interaction.options.getInteger("day");
	const year = interaction.options.getString("year");
	const amount = interaction.options.getInteger("amount");

	await interaction.reply("Attempting to place sell order...", { ephemeral: true });

	if (day.toString().length === 1) day = `0${day}`;

	const data = await closeOption(client, interaction.user.id, input, `${month}${day}${year}`, type, strike.toString(), Math.floor(amount));
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

module.exports = command;
