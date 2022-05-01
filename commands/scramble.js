const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const shuffle = require("shuffle-array");
// create, download, or use a library for the words array
// ex: github.com/words/an-array-of-english-words
const words = require("../objects/words.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("scramble")
    .setDescription("unscramble words before your opponents"),
  
  run: async (interaction) => {
    
    let scrambleDictionary = [].concat(words),
      word = shuffle(scrambleDictionary)[0],
      scrambling = shuffle(word.split("")), 
      scrambledWord = scrambling.join(" "),
      winner = null;

    let richEmbed = new MessageEmbed()
      .setAuthor({ name: `Scramble Time!` })
      .setDescription(`${interaction.user} started scramble!\nThe word to unscramble is:\n` + scrambledWord)
      .setFooter({ text: "Scramble game"})
      .setTimestamp()
      .setColor("RED");

    const scrambleBoard = await interaction.reply({ embeds: [richEmbed], fetchReply: true });

    const filter = message => message.content.toLowerCase().includes(word.toLowerCase());
    const msgListen = interaction.channel.createMessageCollector({ filter, time: 60000 });

    msgListen.on('collect', message => {
      console.log(`Collected ${message.content}`)
      winner = message.member;
      msgListen.stop();
    });

    msgListen.on('end', () => {
      richEmbed
        .setAuthor({ name: "Unscramble! Round ended!" })
        .setDescription(`No winners!\nThe word was:\n` + word)
        .setFields([{ name: `Definition(s)`, value: def, inline: false }]);
      if (winner !== null) richEmbed.setDescription(`${winner} guessed the word and won!\nThe word was:\n` + word)
      scrambleBoard.edit({ embeds: [richEmbed] })
    });

//  console.log(word.toLowerCase())

  },
};
