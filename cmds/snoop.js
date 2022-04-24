const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
	  .setName("snoop")
    .setDescription("catch the last deleted message"),
	run: async (interaction, client) => {
    let richEmbed = new MessageEmbed().setColor("RED").setAuthor({ name: "No snoops found." });
    const snoop = client.snoops.get(`snoop-${interaction.channel.id}`);
    if (!snoop) interaction.reply({ embeds: [richEmbed], ephemeral: true });
    else {
      richEmbed
        .setColor("GREEN")
        .setAuthor({ name: snoop.author, iconURL: snoop.avatar })
        .setDescription(snoop.content)
        .setFooter({ text: "goteem" })
        .setTimestamp(snoop.createdAt);
      if (snoop.attachments !== "") richEmbed.addField("Attachments",snoop.attachments);
      interaction.reply({ embeds: [richEmbed] });
    }
	},
};