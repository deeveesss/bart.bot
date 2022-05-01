module.exports = {
  name: 'messageDelete',
  async run (message, client) {
    if (message.author.bot) return;
    let attached = "";
    if (message.attachments.size >= 1) { message.attachments.forEach(file => { attached += `[Attachment](${file.url}\n)` }) }
    client.snoops.set(`snoop-${message.channel.id}`, {
      author: message.author.tag, avatar: message.author.displayAvatarURL(),
      content: message.content, attachments: attached,
      createdAt: message.createdTimestamp,
    });
  },
};
