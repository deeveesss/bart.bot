module.exports = {
  name: 'messageUpdate',
  async run (oldMessage, newMessage, client) {
    if (newMessage.author.bot) return;
    if (oldMessage.content.toString() === newMessage.content.toString()) return;
    client.snoops.set(`edit-${newMessage.channel.id}`, {
      author: newMessage.author.tag, avatar: newMessage.author.displayAvatarURL(),
      newcontent: newMessage.content, oldcontent: oldMessage.content,
      createdAt: newMessage.createdTimestamp,
    });
  },
};
