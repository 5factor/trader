const Command = require("../util/classes/Command");
const embed = require("../util/functions/embed");
const numeral = require("numeral");
const { getLeaderboard } = require("../util/functions/userData");

const command = new Command({
	name: "leaderboard",
	description: "Global leaderboard"
});

command.run = async function(client, interaction) {
	const leaderboard = getLeaderboard().reverse();
	let place = 1
	let string = "";

	const icons = {
		1: "🥇",
		2: "🥈",
		3: "🥉"
	}

	for (const doc of leaderboard) {
		let user = await client.users.cache.get(doc._id);

		if (!user) {
			user = await client.users.fetch(doc._id)
				.catch(() => null);
		}

		const value = doc.value || 0;
		const cash = doc.stocks["$CASH"].amount || 0;

		string += `${icons[place] ? icons[place] : ""} ${user ? user.tag : "Unknown"}\n↳ Value: **${numeral(value).format("0.0a").toString()}** | Cash: **${numeral(cash).format("0.0a").toString()}**\n\n`;
		place++;
	}

	const e = embed({
		title: "Top 10 Wealthiest Individuals",
		description: string || "",
	});

	return interaction.reply({ embeds: [e] });
}

module.exports = command;