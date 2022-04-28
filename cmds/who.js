const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("who")
    .setDescription("get information on yourself or someone else")
    .addUserOption(option => option
      .setName("target")
      .setDescription("specify a user")),
  run: async (interaction) => {
    let arg = await interaction.options;
    let target = arg.getUser('target') ? arg.getUser('target') : interaction.user;
    let member = await interaction.guild.members.fetch(target.id);
    let avatar = member.displayAvatarURL({dynamic: true, size: 1024});
    let joined = parseInt(member.joinedTimestamp / 1000, 10);
    let created = parseInt(member.user.createdTimestamp / 1000, 10);
    let richEmbed = new MessageEmbed()
      .setAuthor({ name: member.user.tag, iconURL: avatar })
      .setDescription(`Information records for <@${target.id}>`)
      .addField("Registered", `<t:${created}:f>\n_<t:${created}:R>_`, true)
      .addField("Connected", `<t:${joined}:f>\n_<t:${joined}:R>_`, true)
      .setFooter({ text: "ID " + member.user.id })
      .setColor("RED")
      .setTimestamp();
    await interaction.reply({ 
      embeds: [richEmbed]
    });
  },
};
