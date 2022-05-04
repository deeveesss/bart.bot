const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
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

    let phand = [], dhand = [], ptotal = 0, dtotal = 0;
    let game  = client.games.get(interaction.user.id);
    let wager = game ? game.bet : interaction.options.getInteger('bet');

    if (!game) {
      let playerHand = [], dealerHand = [];
      let newDeck = [].concat(cards);
      shuffle(shuffle(shuffle(shuffle(newDeck))));
      playerHand.push(newDeck.pop(), newDeck.pop());
      dealerHand.push(newDeck.pop(), newDeck.pop());
      await client.games.set(interaction.user.id, {
        deck: newDeck, bet: wager,
        dealer: dealerHand, player: playerHand,
        dstand: 0,          pstand: 0,
      });
      game = await client.games.get(interaction.user.id);
      console.log(newDeck.length);
    }

    let richEmbed = new MessageEmbed()
      .setAuthor({ name: "Peparing board..." })
      .setDescription("Fetching deck...")
      .setFooter({ text: "Initializing..." })
      .setColor("RED");

    const gameBoard = await interaction.reply({ embeds: [richEmbed], fetchReply: true });

    let hitButton = new MessageButton().setCustomId('blackjackHit').setStyle('DANGER').setLabel('Hit');
    let stdButton = new MessageButton().setCustomId('blackjackStd').setStyle('DANGER').setLabel('Stand');
    let escButton = new MessageButton().setCustomId('blackjackEsc').setStyle('SECONDARY').setLabel('Cancel');
    let buttonArr = [hitButton, stdButton, escButton]
    let buttons   = new MessageActionRow().addComponents(buttonArr);

    const btnFilter = presser => presser.user.id === interaction.user.id;
    const btnListen = interaction.channel.createMessageComponentCollector({ btnFilter, time: 10000 });

    btnListen.on('collect', i => {
      i.deferUpdate();
      if (i.customId === 'blackjackHit') { 
        game.player.push(game.deck.pop());
        checkHands();
        btnListen.resetTimer();
      }
      if (i.customId === 'blackjackStd') { 
        game.pstand = 1;
        checkHands();
      }
      if (i.customId === 'blackjackEsc') {
        client.games.delete(interaction.user.id);
        btnListen.stop();
      }
    });

    btnListen.on('end', () => gameBoard.edit({ components: [] }) );

    function updateGame() {
      buttons = null;
      gameBoard.edit({ embeds: [richEmbed], components: [] });
      client.games.delete(interaction.user.id);
      btnListen.stop();
    }

    function calcHands() {
      phand = [], dhand = [], dtotal = 0, ptotal = 0;
      for (const card of game.player) { phand.push("\\" + card.suit + card.rank); ptotal += card.value; }
      for (const card of game.dealer) { dhand.push("\\" + card.suit + card.rank); dtotal += card.value; }
      if (game.player.find(card => card.value === 1 ) && ptotal <= 11) ptotal += 10;
      if (game.dealer.find(card => card.value === 1 ) && dtotal <= 11) dtotal += 10;
    }

    function checkHands() {

      calcHands();
      if (phand.length > 2 || game.pstand === 1) escButton.setDisabled();

      let hideDealer = { name: `Dealer Hand (??)`, value: `${dhand[0]}**\\??**`, inline: false },
          handDealer = { name: `Dealer Hand (${dtotal})`, value: dhand.join(""), inline: false },
          handPlayer = { name: `Player Hand (${ptotal})`, value: phand.join(""), inline: false },
          betWasJack = { name: `Winnings`, value: `${Math.floor(wager * 1.666667)}`, inline: false },
          betWasWins = { name: `Winnings`, value: `${wager}`, inline: false },
          betWasLose = { name: `Losses`, value: `${wager * -1}`, inline: false },
          betWasNull = { name: `Bet Reclaimed`, value: `${wager}`, inline: false };

      richEmbed
        .setFields([hideDealer, handPlayer])
        .setAuthor({ name: "Well, go on then!" })
        .setDescription("What'll it be?")
        .setFooter({ text: "Blackjack" })
        .setTimestamp();

      // blackjack
      if ((ptotal === 21 && game.player.length === 2) || (dtotal === 21 && game.dealer.length === 2)) {
        if (dtotal === ptotal) {
          richEmbed
            .setAuthor({ name: "It's a draw!" })
            .setDescription("Oh, seems it's a draw.")
            .setFields([handDealer, handPlayer]);
          if (wager > 0) richEmbed.setFields([betWasNull, handDealer, handPlayer]);
          // ...
        }
        else if (ptotal === 21) {
          richEmbed
            .setAuthor({ name: "Blackjack! You win!" })
            .setDescription("A fine hand!")
            .setFields([handDealer, handPlayer]);
          if (wager > 0) richEmbed.setFields([betWasJack, handDealer, handPlayer]);
          // ...
        }
        else if (dtotal === 21) {
          richEmbed
            .setAuthor({ name: "Blackjack! You lose!" })
            .setDescription("Luck is on my side!")
            .setFields([handDealer, handPlayer]);
          if (wager > 0) richEmbed.setFields([betWasLose, handDealer, handPlayer]);
          // ...
        }
        updateGame();
      }

      // bust
      else if (ptotal > 21 || dtotal > 21) {
        if (ptotal > 21) {
          richEmbed
            .setAuthor({ name: "Busted! You lose!" })
            .setDescription("Hnmm... not today.")
            .setFields([handDealer, handPlayer]);
          if (wager > 0) richEmbed.setFields([betWasLose, handDealer, handPlayer]);
          // ...
        }
        else if (dtotal > 21) {
          richEmbed
            .setAuthor({ name: "You win!" })
            .setDescription("How embarrassing...")
            .setFields([handDealer, handPlayer]);
          if (wager > 0) richEmbed.setFields([betWasWins, handDealer, handPlayer]);
          // ...
        }
        updateGame();
      }

      // stand
      else if (game.pstand === 1) {
        if (dtotal > 16) game.dstand = 1; //lol ai
        if (game.dstand === 0) {
          game.dealer.push(game.deck.pop());
          checkHands();
        }
        else {
          if (ptotal === dtotal) {
            richEmbed
              .setAuthor({ name: "It's a draw!" })
              .setDescription("No winners today.")
              .setFields([handDealer, handPlayer]);
            if (wager > 0) richEmbed.setFields([betWasNull, handDealer, handPlayer]);
            // ...
          }
          else if (ptotal > dtotal) {
            richEmbed
              .setAuthor({ name: "You win!" })
              .setDescription("Don't be rude.")
              .setFields([handDealer, handPlayer]);
            if (wager > 0) richEmbed.setFields([betWasWins, handDealer, handPlayer]);
            // ...
          }
          else if (ptotal < dtotal) {
            richEmbed
              .setAuthor({ name: "You lose!" })
              .setDescription("Haha! Loser!")
              .setFields([handDealer, handPlayer]);
            if (wager > 0) richEmbed.setFields([betWasLose, handDealer, handPlayer]);
            // ...
          }
          updateGame();
        }
      }
      else if (ptotal === 21) { 
        game.pstand = 1; checkHands();
      }

      // hit & no bust or wins
      else {
        gameBoard.edit({ embeds: [richEmbed], components: [buttons] });
      }
    }

    // run for initial command
    checkHands();
  },
};

//god damn percocet this was not fun
