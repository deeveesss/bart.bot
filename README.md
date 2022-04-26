# bart.bot
a discord bot programmed with spite
> anything you can do, i can do better

runs on node.js, utlizing the discord.js library
hosted on debian 11 (bullseye) OS via AWS

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
