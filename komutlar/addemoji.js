const Discord = require('discord.js')

exports.run = (client, message, args) => {
  
  let guild = message.guild
  let link = args[0]
  let ad = args[1]
  if (!link) return message.channel.send(
  new Discord.MessageEmbed()
  .setDescription(':x: You must specify an emoji link.'))
  if (!ad) return message.channel.send(
  new Discord.MessageEmbed()
  .setDescription(':x: You have to write an emoji name.'))

  guild.emojis.create(link, ad)
    .then(emoji => message.channel.send(`:white_check_mark: ${emoji.name} emoji created. (${emoji}) `))
}

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: ['hızlı-emoji', 'add-emoji', 'c', 'hızlıemoji'],
  permLevel: 0
}

exports.help = {
  name: 'addemoji',
  description: 'Hızlı emoji eklersiniz.',
  usage: 'addemoji'
}