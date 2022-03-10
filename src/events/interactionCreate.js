module.exports = async function (client, interaction) {
    const command = await client.commands.get(interaction.commandName);

    if (command) {
        let userData = await client.userDao.get(interaction.user.id);

        if (!userData) {
            await client.userDao.create(interaction.user.id);
        }

        return await command.run(client, interaction);
    } else {
        return await interaction.reply({ content: "An error has occurred while attempting to run this command.", ephemeral: true })
    }
}