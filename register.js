const fs = require('node:fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, serverId, token } = require('./config.json');

const commands = [];
const cmdFiles = fs.readdirSync('./cmds').filter(file => file.endsWith('.js'));
for (const file of cmdFiles) { const cmd = require(`./cmds/${file}`); commands.push(cmd.data.toJSON()) }

const rest = new REST({ version: '9' }).setToken(token);
rest.put(Routes.applicationGuildCommands(clientId, serverId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);