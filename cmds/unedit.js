const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unedit")
    .setDescription("catch the last edited message"),
  run: async (interaction) => {
    let richEmbed = new MessageEmbed().setColor("RED").setAuthor({ name: "No edits found." });
    const unedit = await interaction.client.snoops.get(`edit-${interaction.channel.id}`);
    if (!unedit) await interaction.reply({ embeds: [richEmbed], ephemeral: true });
    else {
      richEmbed
        .setColor("#bf8cff")
        .setAuthor({ name: unedit.author, iconURL: unedit.avatar })
        .setDescription(unedit.newcontent)
        .addField("Original", unedit.oldcontent)
        .setFooter({ text: "Unedited" })
        .setTimestamp(unedit.createdAt);
      await interaction.reply({ embeds: [richEmbed] });
    }
  },
};
