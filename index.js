// initialize bot client instance
const { Client, Collection, Intents } = require('discord.js');
const { token } = require('./config.json');
const client = new Client({ intents: [
  Intents.FLAGS.GUILDS, 
  Intents.FLAGS.GUILD_MEMBERS,
  Intents.FLAGS.GUILD_MESSAGES, 
  Intents.FLAGS.GUILD_MESSAGE_REACTIONS, ],
});

// various maps / collections
client.games = new Collection();
client.snoops = new Collection();
client.buttons = new Collection();
client.commands = new Collection();

// load handles from dirs
const fs = require('node:fs');

const cmdFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of cmdFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command)
}

const btnFiles = fs.readdirSync('./buttons').filter(file => file.endsWith('.js'));
for (const file of btnFiles) {
  const button = require(`./buttons/${file}`);
  client.buttons.set(button.name, button)
}

const evtFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of evtFiles) {
  const event = require(`./events/${file}`);
  if (event.once) client.once(event.name, (...args) => event.run(...args));
  else client.on(event.name, (...args) => event.run(...args, client));
}

//login
client.login(token);

//process errors
process.on('unhandledRejection', o_O => console.error(`Uncaught Promise Error:\n${o_O.stack}`));
