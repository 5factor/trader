const Command = require("../util/classes/Command");
const embed = require("../util/functions/embed");
const { getContract } = require("../util/functions/ameritrade");

const command = new Command({
	name: "option",
	description: "Lookup a option contract",
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
	]
});

command.run = async function(client, interaction) {
	const input = interaction.options.getString("ticker");
	const type = interaction.options.getString("type");
	const strike = interaction.options.getInteger("strike");
	const month = interaction.options.getString("month");
	let day = interaction.options.getInteger("day");
	const year = interaction.options.getString("year");

	if (day.toString().length === 1) day = `0${day}`;

	await interaction.reply("Attempting to retrieve information...", { ephemeral: true });

	const data = await getContract(input, `${month}${day}${year}`, type, strike.toString());
	if (typeof data === "string") return interaction.followUp({ content: data, ephemeral: true });

	const { underlying, description, bidPrice, bidSize, askPrice, askSize, lastPrice, totalVolume, delta, gamma, theta, vega, rho} = data;

	const e = embed({
		title: underlying,
		description: description,
		fields: [
			{ name: "Last", value: lastPrice.toString(), inline: true },
			{ name: "Bid/Ask", value: `${bidPrice} (${bidSize})/${askPrice} (${askSize})`, inline: true },
			{ name: "Volume", value: totalVolume.toString(), inline: true },
			{ name: "Delta", value: delta.toString(), inline: true },
			{ name: "Gamma", value: gamma.toString(), inline: true },
			{ name: "Theta", value: theta.toString(), inline: true },
			{ name: "Vega", value: vega.toString(), inline: true },
			{ name: "Rho", value: rho.toString(), inline: true },
		],
	});

	return interaction.followUp({ embeds: [e] });
}

module.exports = command;