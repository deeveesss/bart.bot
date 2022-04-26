const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
//const { Database } = require("@devsnowflake/quick.db");
//const db = new Database("../json.db");
const shuffle = require("shuffle-array");
const cards = require("../objects/cards.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("blackjack")
    .setDescription("play a game of blackjack")
    .addIntegerOption(option => option
      .setName("bet")
      .setDescription("wager for potential winnings")),
  run: async (interaction, client) => {
    let arg = await interaction.options;
    let wager = arg.getInteger('bet') ? arg.getInteger('bet') : 0;
    let game = await client.games.get(interaction.user.id);

    if (!game) {
      let playerHand = [], dealerHand = [];
      let shuffledDeck = shuffle(shuffle(cards));
      playerHand.push(shuffledDeck.pop());
      dealerHand.push(shuffledDeck.pop());
      playerHand.push(shuffledDeck.pop());
      dealerHand.push(shuffledDeck.pop());
      await client.games.set(interaction.user.id, {
        deck: shuffledDeck,
        dealer: dealerHand, player: playerHand,
        dstand: 0,          pstand: 0,
      });
      game = await client.games.get(interaction.user.id)
    }

    let phand = [],
        dhand = [],
        ptotal = 0, 
        dtotal = 0;

    function calcHands() {
      phand = [], dhand = [], dtotal = 0, ptotal = 0;
      game.player.forEach(card=> { 
        phand.push(`${card.suit}${card.rank}`);
        ptotal += card.value;
      });
      game.dealer.forEach(card=> { 
        dhand.push(`${card.suit}${card.rank}`);
        dtotal += card.value;
      });
      if (game.player.find(card => card.value === 1 ) && ptotal <= 11) ptotal += 10;
      if (game.dealer.find(card => card.value === 1 ) && dtotal <= 11) dtotal += 10;
    }

    let richEmbed = new MessageEmbed()
      .setColor("RED")
      .setAuthor({ name: "Blackjack" })
      .setFooter({ text: "Initializing" });

    let hitButton = new MessageButton().setCustomId('blackjackHit').setStyle('DANGER').setLabel('Hit');
    let stdButton = new MessageButton().setCustomId('blackjackStd').setStyle('DANGER').setLabel('Stand');
    let escButton = new MessageButton().setCustomId('blackjackEsc').setStyle('SECONDARY').setLabel('Cancel');
    let buttonArr = [hitButton, stdButton, escButton]
    let buttons   = new MessageActionRow().addComponents(buttonArr);

    function doRound() {

      calcHands();
      if (phand.length > 2 || game.pstand === 1) escButton.setDisabled();

      let handPlayer = { name: `Player Hand (${ptotal})`, value: phand.join(""), inline: true }
      let handDealer = { name: `Dealer Hand (${dtotal})`, value: dhand.join(""), inline: true }
      let hideDealer = { name: `Dealer Hand (??)`, value: `${dhand[0]}❔?`, inline: true }
      richEmbed.setFields([handPlayer, hideDealer])

      // blackjack
      if (ptotal === 21 || dtotal === 21) {
        buttonArr.forEach(btn => btn.setDisabled())
        if (dtotal === ptotal) {
          richEmbed.setDescription("**Draw**").setFields([handPlayer, handDealer]);
          // ...
        }
        else if (ptotal === 21) {
          richEmbed.setDescription(`**Blackjack:** ${interaction.user}`).setFields([handPlayer, handDealer]);
          // ...
        }
        else if (dtotal === 21) {
          richEmbed.setDescription(`**Blackjack: Dealer**`).setFields([handPlayer, handDealer]);
          // ...
        }
      }
      
      // bust
      else if (ptotal > 21 || dtotal > 21) {
        buttonArr.forEach(btn => btn.setDisabled())
        if (ptotal > 21) {
          richEmbed.setDescription(`**Bust:** ${interaction.user}`).setFields([handPlayer, handDealer]);
          // ...
        }
        else if (dtotal > 21) {
          richEmbed.setDescription("**Bust:** Dealer").setFields([handPlayer, handDealer]);
          // ...
        }
        client.games.delete(interaction.user.id);
      }

      // standing
      else if (game.pstand === 1) {
        buttonArr.forEach(btn => btn.setDisabled())
        if (dtotal > 16) game.dstand = 1; //lol ai
        if (game.dstand === 0) {
          game.dealer.push(game.deck.pop());
          doRound();
        }
        else if (ptotal === dtotal) {
          richEmbed.setDescription("**Draw**").setFields([handPlayer, handDealer]);
          client.games.delete(interaction.user.id);
          // ...
        }
        else if (ptotal > dtotal) {
          richEmbed.setDescription(`**Win:** ${interaction.user}`).setFields([handPlayer, handDealer]);
          client.games.delete(interaction.user.id);
          // ...
        }
        else if (ptotal < dtotal) {
          richEmbed.setDescription("**Win: Dealer**").setFields([handPlayer, handDealer]);
          client.games.delete(interaction.user.id);
          // ...
        }
      }
      
      console.log(`dealer: (${dtotal}) ${dhand} ${game.dstand === 1 ? "[STAND]" : ""}\nplayer: (${ptotal}) ${phand}`);
      interaction.fetchReply().then(reply =>  reply.edit({ embeds: [richEmbed], components: [buttons] }) );
    }

    await interaction.reply({ components: [buttons], embeds: [richEmbed] });
    doRound();

    const filter = presser => presser.user.id === interaction.user.id;
    const btnListen = await interaction.channel.createMessageComponentCollector({ filter, time: 10000 });
    btnListen.on('collect', i => {
      if (i.customId === 'blackjackHit') {
        btnListen.resetTimer();
        game.player.push(game.deck.pop());
        doRound();
      }
      if (i.customId === 'blackjackStd') {
        game.pstand = 1;
        doRound();
      }
      if (i.customId === 'blackjackEsc') {
        richEmbed.setDescription("Game cancelled.");
        client.games.delete(interaction.user.id);
        btnListen.stop();
      }
    });
    btnListen.on('end', () => {
      interaction.fetchReply().then(reply =>  reply.edit({ embeds: [richEmbed], components: [] }) );
    });

  },
};

//god damn percocet this was not fun
