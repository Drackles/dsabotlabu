   const Discord = require('discord.js');
exports.run = async (client, message, args) => {

let anket = args.slice(0).join(" ")
if(!anket) return message.channel.send("Write what you want to questionnaire about.")

let Kexpert = new Discord.MessageEmbed()
.setFooter(message.author.tag, message.author.avatarURL())
.setColor("RANDOM")
.setTitle(message.guild.name +" Questionnaire")
.setDescription(`
${anket}

✅ → You Accept the Questionnaire.
❌ → You do not accept the Questionnaire.
`)
message.channel.send(Kexpert).then(async m => {
await m.react("✅")
await m.react("❌")
})
}
// BY: dcs
exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: 0
}

exports.help = {
  name: 'poll',
  description: "Discord Code Share Anket Komutu",
  usage: '<prefix>anket <ahnketyapılcakmesaj>'
}