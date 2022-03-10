const { MessageEmbed } = require("discord.js");

module.exports = function (data) {
    const embed = new MessageEmbed();

    data.title ? embed.setTitle(data.title) : null;
    data.image ? embed.setImage(data.image) : null;
    data.description ? embed.setDescription(data.description) : null;
    data.thumbnail ? embed.setThumbnail(data.thumbnail) : null;
    data.color ? embed.setColor(data.color) : embed.setColor("BLUE");
    data.footer ? embed.setFooter({ text: data.footer[0], iconURL: data.footer[1]}) : null;
    data.timestamp ? embed.setTimestamp() : null;
    data.author ? embed.setAuthor({ name: data.author[0], iconURL: data.author[1]}) : null;

    if (data.fields) {
        embed.addFields(data.fields);
    }

    return embed;
}