module.exports = {
  name: "example",
  run: async (interaction) => {
    await interaction.reply({ content: "This is an example.", ephemeral: true }).then(() => {
      interaction.member.kick("Example worked :)");
    });
  },
};
