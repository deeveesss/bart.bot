const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
	  .setName("unedit")
    .setDescription("catch the last edited message"),
	run: async (interaction, client) => {
    let richEmbed = new MessageEmbed().setColor("RED").setAuthor({ name: "No edits found." });
    const unedit = client.snoops.get(`edit-${interaction.channel.id}`);
    if (!unedit) interaction.reply({ embeds: [richEmbed], ephemeral: true });
    else {
      richEmbed
        .setColor("GREEN")
        .setAuthor({ name: unedit.author, iconURL: unedit.avatar })
        .setDescription(unedit.newcontent)
        .addField("Original", unedit.oldcontent)
        .setFooter({ text: "goteem" })
        .setTimestamp(unedit.createdAt);
      interaction.reply({ embeds: [richEmbed] });
    }
	},
};