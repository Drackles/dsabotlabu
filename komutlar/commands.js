const Discord = require("discord.js");
const db = require('quick.db');
const ayarlar = require('../ayarlar.json');
let prefix = ayarlar.prefix

module.exports.run= async(client, message, args) => {
   
let embed = new Discord.MessageEmbed()
.setTitle(client.user.username+" Commands Menu")
.setColor("BLUE")
.setThumbnail(client.user.avatarURL())
.setDescription(`
  ▬▬▬▬▬▬▬▬ \`\`\📣Commands📣\`\`\ ▬▬▬▬▬▬▬▬
> :notepad_spiral:\`${prefix}calldsa\` **:: You will call DSA for assistance..**
> :notepad_spiral:\`${prefix}coffe\` **:: You can buy coffee for everyone.**
> :notepad_spiral:\`${prefix}vote\` **:: You can start a vote on any topic.**
> :notepad_spiral:\`${prefix}suggestion\` **:: You can suggest whatever in-game or discord.**
> :notepad_spiral:**Currently Used Prefix =** \`${prefix}\`
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
**Created by Drackles...**

`)

message.channel.send(embed)
}
module.exports.conf = {
aliases: ['commands']
}

module.exports.help = {
name: "commands"
}