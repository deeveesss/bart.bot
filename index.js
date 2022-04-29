// initialize bot client instance
const { Client, Collection, Intents, MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const { token, prefix, devId } = require('./config.json');
const client = new Client({ intents: [
  Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS,
  Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, ],
});

//snooping
client.games = new Collection();
client.snoops = new Collection();
client.buttons = new Collection();
client.commands = new Collection();

//load from files
const fs = require('node:fs');

const cmdFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of cmdFiles) { const command = require(`./commands/${file}`); client.commands.set(command.data.name, command) }

const btnFiles = fs.readdirSync('./buttons').filter(file => file.endsWith('.js'));
for (const file of btnFiles) { const button = require(`./buttons/${file}`); client.buttons.set(button.name, button) }

const evtFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of evtFiles) {
  const e = require(`./events/${file}`);
  if (e.once) client.once(e.name, (...args) => e.run(...args));
  else client.on(e.name, (...args) => e.run(...args, client));
}

//processing
client.on('interactionCreate', async interaction => {
  if (interaction.isCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try { await command.run(interaction, client); } 
    catch (error) {
      console.error(error);
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  }
  if (interaction.isButton()) {
    const button = client.buttons.get(interaction.customId);
    if (!button) return;
    try { await button.run(interaction, client); } 
    catch (error) {
      console.error(error);
      await interaction.reply({ content: 'There was an error while executing this button!', ephemeral: true });
    } 
  }
});

//login
client.login(token);

//process errors
process.on('unhandledRejection', o_O => console.error(`Uncaught Promise Error:\n${o_O.stack}`));
