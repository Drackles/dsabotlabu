const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const ayarlar = require('../ayarlar.json');
var prefix = ayarlar.prefix;

module.exports = client => {
 setInterval(function() {
}, 8000);
  var msgArray = [
"DSA x SAPD x FBI",
"DSA",
"Detective Service",
    "DSA FOREVER!"
 ];

 setInterval(() => {
  var rastgeleOyun = Math.floor(Math.random() * msgArray.length);
  client.user.setActivity(`${msgArray[rastgeleOyun]}`, { type: 'LISTENING' ,  url: 'https://www.twitch.tv/amouranth' })
}, 5000);
    console.log(`Bot Ready | youtube.com/drackles`);
}