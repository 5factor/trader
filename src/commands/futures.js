const Command = require("../util/classes/Command");
const { getTicker } = require("../util/functions/ameritrade");
const embed = require("../util/functions/embed");
const numeral = require("numeral");

const command = new Command({
	name: "futures",
	description: "Lookup stock market futures",
	options: [
		{
			"type": 3,
			"name": "ticker",
			"description": "eg. $SPX.X",
			"required": true
		}
	]
});

command.run = async function(client, interaction) {
	const input = interaction.options.getString("ticker");

	await interaction.reply("Attempting to retrieve information...", { ephemeral: true });

	let stock = await getTicker(input.toUpperCase())
		.catch((e) => {
			return interaction.followUp({ content: "An error occurred while attempting to fetch stock information. Did you input a valid ticker?", ephemeral: true });
		});
	if (!stock) return;

	let { symbol, description, lastPrice, openPrice, highPrice, lowPrice, totalVolume, netChange } = stock;

	const e = embed({
		title: symbol,
		description: description,
		fields: [
			{ name: "Last Price", value: `$${lastPrice ? lastPrice.toString() : "N/A"}`, inline: true },
			{ name: "Volume", value: `${totalVolume ? numeral(totalVolume).format("0.0a").toString() : "N/A"}`, inline: true },
			{ name: "Change", value: `${netChange ? `${netChange.toString()}` : "N/A"}`, inline: true },
			{ name: "Open", value: `${openPrice ? openPrice.toString() : "N/A"}`, inline: true },
			{ name: "Low", value: `${lowPrice ? lowPrice.toString() : "N/A"}`, inline: true },
			{ name: "High", value: `${highPrice ? highPrice.toString() : "N/A"}`, inline: true },
		],
	});

	return interaction.followUp({ embeds: [e] });
}

module.exports = command;