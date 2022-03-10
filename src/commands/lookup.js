const Command = require("../util/classes/Command");
const finviz = require("finvizor");
const embed = require("../util/functions/embed");
const moment = require("moment");
const numeral = require("numeral");

const command = new Command({
	name: "lookup",
	description: "Lookup a stock ticker",
	options: [
		{
			"type": 3,
			"name": "ticker",
			"description": "eg. AAPL",
			"required": true
		}
	]
});

command.run = async function(client, interaction) {
	const input = interaction.options.getString("ticker");

	await interaction.reply("Attempting to retrieve information...", { ephemeral: true });

	let stock = await finviz.stock(input)
		.catch((e) => {
			return interaction.followUp({ content: "An error occurred while attempting to fetch stock information. Did you input a valid ticker?", ephemeral: true });
		});
	if (!stock) return;

	let { name, site, sector, industry, country, index, avgVolume, price, change, ticker, exchange, earnings, dividend, marketCap } = stock;

	if (earnings) {
		const formatted = moment(earnings.date).format("llll");
		earnings = formatted;
	}

	const e = embed({
		title: ticker,
		description: `[**${name}**](${site})\nSector: **${sector}**\nIndustry: **${industry}**\nCountry: **${country}**`,
		fields: [
			{ name: "Price", value: `$${price ? price.toString() : "N/A"}`, inline: true },
			{ name: "Market Cap", value: `$${marketCap ? numeral(marketCap).format("0.0a").toString() : "N/A"}`, inline: true },
			{ name: "Avg. Volume", value: `${avgVolume ? numeral(avgVolume).format("0.0a").toString() : "N/A"}`, inline: true },
			{ name: "Change", value: `${change ? `${change.toString()}%` : "N/A"}`, inline: true },
			{ name: "Exchange", value: `${exchange ? exchange.toString() : "N/A"}`, inline: true },
			{ name: "Index", value: `${index ? index.toString() : "N/A"}`, inline: true },
			{ name: "Earnings", value: `${earnings ? earnings.toString() : "N/A"}`, inline: true },
			{ name: "Annual Dividend", value: `$${dividend ? dividend.toString() : "N/A"}`, inline: true },
		],
	});

	return interaction.followUp({ embeds: [e] });
}

module.exports = command;