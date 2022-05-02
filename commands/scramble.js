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
  //-- difficulty filters --
    .addIntegerOption(option => 
      option
        .setName("difficulty")
        .setDescription("The the difficulty of the game")
        .setMinValue(1)
        .setMaxValue(3) ),
  run: async (interaction) => {
    let scrambleDictionary = [];
//-- difficulty filters --
    let difficulty = interaction.options.getInteger("difficulty");

    switch (difficulty) {
      default:
        for (const e of words) if (e.word.length <= 5) scrambleDictionary.push(e);
        break;
      case 1:
        for (const e of words) if (e.word.length >= 4 && e.word.length <= 6) scrambleDictionary.push(e);
        break;
      case 2:
        for (const e of words) if (e.word.length >= 5 && e.word.length <= 8) scrambleDictionary.push(e); 
        break;
      case 3:
        for (const e of words) if (e.word.length >= 7) scrambleDictionary.push(e); 
        break;
    }
// shuffle the list and grab first object,
// split the word into an array, shuffle the array,
// join the array back together, set winner variable.    
    let word = shuffle(scrambleDictionary)[0],
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
