// initialize bot client instance
const { Client, Collection, Intents } = require('discord.js');
const { token } = require('./config.json');
const client = new Client({ intents: [
  Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS,
  Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, ],
});
//load commands from files
const fs = require('node:fs');
client.commands = new Collection();
const cmdFiles = fs.readdirSync('./cmds').filter(file => file.endsWith('.js'));
for (const file of cmdFiles) { const cmd = require(`./cmds/${file}`); client.commands.set(cmd.data.name, cmd) }
//console update
client.once('ready', () => { console.log(`[Status] Online.`); client.user.setActivity("you.", {type:"WATCHING"}) });
//snooping
client.snoops = new Collection();
client.on("messageDelete", async message => {
  if (message.author.bot) return;
  let attached = "";
  if(message.attachments.size >= 1) { message.attachments.forEach(file => { attached += `[Attachment](${file.url}\n)` }) }
  client.snoops.set(`snoop-${message.channel.id}`, {
    author: message.author.tag, avatar: message.author.displayAvatarURL(),
    content: message.content, attachments: attached,
    createdAt: message.createdTimestamp,
  });
});
client.on("messageUpdate", async (oldMessage, newMessage) => {
  if (newMessage.author.bot) return;
  if(oldMessage.content.toString()===newMessage.content.toString()) return;
  client.snoops.set(`edit-${newMessage.channel.id}`, {
    author: newMessage.author.tag, avatar: newMessage.author.displayAvatarURL(),
    newcontent: newMessage.content, oldcontent: oldMessage.content,
    createdAt: newMessage.createdTimestamp,
  });
});
//processing
client.games = new Collection();
client.on('interactionCreate', async interaction => {
  if (interaction.isButton()) interaction.deferUpdate();
  if (interaction.isCommand()) {  
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try { await command.run(interaction, client); } 
  catch (error) {
    console.error(error);
    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  }
});

//login
client.login(token);
//process errors
process.on('unhandledRejection', o_O => console.error(`Uncaught Promise Error:\n${o_O.stack}`));
