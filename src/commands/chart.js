const { MessageAttachment } = require("discord.js");
const Command = require("../util/classes/Command");
const finviz = require("finvizor");
const embed = require("../util/functions/embed");

const command = new Command({
	name: "chart",
	description: "Retrieve a stock chart",
	options: [
		{
			"type": 3,
			"name": "ticker",
			"description": "eg. AAPL",
			"required": true
		},
		{
			"type": 3,
			"name": "timeframe",
			"description": "timeframe",
			"choices": [{ name: "1D", value: "1D" }, { name: "5D", value: "5D" }, { name: "1M", value: "1M" }, { name: "3M", value: "3M" }, { name: "6M", value: "6M" }, { name: "YTD", value: "YTD" }, { name: "1Y", value: "1Y" }, { name: "5Y", value: "5Y" }, { name: "All", value: "All" }],
			"required": true
		},
	]
});

command.run = async function(client, interaction) {
	const { getChart } = require("../util/functions/charts");
	const input = interaction.options.getString("ticker");
	const timeframe = interaction.options.getString("timeframe");

	let stock = await finviz.stock(input)
		.catch((e) => {
			return interaction.reply({ content: "An error occurred while attempting to fetch stock information. Did you input a valid ticker?", ephemeral: true });
		});
	if (!stock) return;

	let { ticker } = stock;

	await interaction.reply("Generating chart...");

	let chartImage;
	const rawImage = await getChart(ticker, timeframe)
		.catch(async (e) => {
			console.log(e);
			return await interaction.followUp("An error has occured.");
		});

	if (rawImage) {
		chartImage = new MessageAttachment(rawImage, "chart.png");
	}

	const e = embed({
		title: ticker,
		image: "attachment://chart.png",
	});

	await interaction.followUp({ embeds: [e], files: [chartImage] });
}

module.exports = command;