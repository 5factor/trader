const Command = require("../util/classes/Command");
const embed = require("../util/functions/embed");

const command = new Command({
	name: "help",
	description: "Learn how the bot works"
});

command.run = async function(client, interaction) {
	const e = embed({
		title: "Trader",
		description: `Trader is a Discord bot that gives users the ability to lookup stocks, options, and futures. Users can also papertrade using the bot.`,
		fields: [
			{ name: "Trading", value: `You can buy and sell stocks/options using the /buy and /sell command.` },
			{ name: "Lookup", value: `You can lookup stocks with /lookup, futures with /future, options with /option.` },
			{ name: "Accounts", value: `Your **main account** starts with **$100k**. This is your primary account and it shows up on the leaderboard. Your secondary account starts with **$1M**.` },
		]
	});

	await interaction.reply({ embeds: [e] });
}

module.exports = command;