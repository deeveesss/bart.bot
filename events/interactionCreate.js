module.exports = {
  name: 'interactionCreate',
  async run (interaction, client) {
    if (interaction.isCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      try { await command.run(interaction, client); } 
      catch (error) {
        console.error(error);
        await interaction.reply({ content: "There was an error performing this operation", ephemeral: true });
      }
    }
    if (interaction.isButton()) {
      const button = client.buttons.get(interaction.customId);
      if (!button) return;
      try { await button.run(interaction, client); } 
      catch (error) {
        console.error(error);
        await interaction.reply({ content: "There was an error performing this operation", ephemeral: true });
      } 
    }
  },
};
