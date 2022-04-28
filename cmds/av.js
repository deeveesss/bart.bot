const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("av")
    .setDescription("get your or another user's avatar")
    .addUserOption(option => option
      .setName("target")
      .setDescription("specify a user")),
  run: async (interaction) => {
    let arg = interaction.options;
    let target = arg.getUser('target') ? arg.getUser('target') : interaction.user;
    let member = await interaction.guild.members.fetch(target.id);
    let avatar = await member.displayAvatarURL({dynamic: true, size: 1024});
    let richEmbed = new MessageEmbed()
      .setAuthor({ name: member.user.tag, iconURL: avatar })
      .setImage(avatar)
      .setColor("#bf8cff");
    await interaction.reply({ 
      embeds: [richEmbed]
    });
  },
};
