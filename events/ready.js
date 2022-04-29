module.exports = {
  name: 'ready',
  once: true,
  run(client) {
    console.log(`[Status] Online.\nLogged in as ${client.user.tag}`);
  },
};