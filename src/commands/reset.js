const Command = require("../util/classes/Command");

const command = new Command({
	name: "resetdata",
	description: "Start over from scratch"
});

command.run = async function(client, interaction) {
	await interaction.reply("Attempting to reset user data...", { ephemeral: true });

	await client.userDao.update(interaction.user.id, {
		value: 0,
		stocks: { $CASH: { amount: 100_000, average: 1 } },
		options: {},
		history: []
	})
		.catch(() => null);

	return interaction.followUp("Data reset", { ephemeral: true });
}

module.exports = command;