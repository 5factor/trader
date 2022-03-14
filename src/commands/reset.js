const Command = require("../util/classes/Command");

const command = new Command({
	name: "resetdata",
	description: "Start over from scratch"
});

command.run = async function(client, interaction) {
	await interaction.reply({ content: "Attempting to reset user data...", ephemeral: true });

	await client.userDao.update(interaction.user.id, {
		primary: {
			value: 0,
			stocks: { $CASH: { amount: 100_000, average: 1 } },
			options: {},
			futures: {},
			history: [],
			trades: 0
		},
		secondary: {
			value: 0,
			stocks: { $CASH: { amount: 1_000_000, average: 1 } },
			options: {},
			futures: {},
			history: [],
			trades: 0
		}
	})
		.catch(() => null);

	return interaction.followUp({ content: "Data reset.", ephemeral: true });
}

module.exports = command;