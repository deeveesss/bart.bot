# bart.bot
a discord bot programmed with spite
> anything you can do, i can do better

programmed with [node.js](https://github.com/nodejs/node), utlizing the [discord.js](https://github.com/discordjs/discord.js) v13 library
hosted on debian 11 (bullseye) OS via AWS

this repo exists to showcase the barebones features of the production bot. expect end result from some of these to differ from Bartholomew
### tracing errors
newbie here learning? add these to the bottom of your index file to trace errors.
```javascript
process.on("uncaughtException", (error) => {
  console.log("Exception Error: " + error) 
});
process.on("unhandledRejection", (reason, promise) => {
  console.log("Promise Error: ", promise, " info: ", reason.message)
});
```
### installing node
spoodfeed for installing node on debian:
```shell
# login as root
su -
# add repo and install
curl -fsSL https://deb.nodesource.com/setup_17.x | bash -
apt-get install -y nodejs
# exit root
exit
# install dependencies
npm install discord-api-types discord.js @discordjs/builders @discordjs/rest shuffle-array
```
### better-sqlite3
spoonfeed for installing [better-sqlite3](https://github.com/JoshuaWise/better-sqlite3) on debian:
```shell
# install compilers and python
sudo apt-get install build-essential
sudo apt-get install python
# install better-sqlite3 and dependency
npm install node-gyp better-sqlite3
```
