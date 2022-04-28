const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("snoop")
    .setDescription("catch the last deleted message"),
  run: async (interaction) => {
    let richEmbed = new MessageEmbed().setColor("RED").setAuthor({ name: "No snoops found." });
    const snoop = await interaction.client.snoops.get(`snoop-${interaction.channel.id}`);
    if (!snoop) await interaction.reply({ embeds: [richEmbed], ephemeral: true });
    else {
      richEmbed
        .setColor("GREEN")
        .setAuthor({ name: snoop.author, iconURL: snoop.avatar })
        .setDescription(snoop.content)
        .setFooter({ text: "Snooped" })
        .setTimestamp(snoop.createdAt);
      if (snoop.attachments !== "") richEmbed.addField("Attachments",snoop.attachments);
      await interaction.reply({ embeds: [richEmbed] });
    }
  },
};
