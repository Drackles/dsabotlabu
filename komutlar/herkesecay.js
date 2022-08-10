const Discord = require('discord.js');
const ayarlar = require('../ayarlar.json');

exports.run = (client, message, params) => {
	if (!message.guild) {
    const ozelmesajuyari = new Discord.MessageEmbed()
    .setColor(0xFF0000)
    .setTimestamp()
    .setAuthor(message.author.username, message.author.avatarURL())
    .addField('**Fun Commands Cannot Be Used in Private Messages!**')
    return message.author.send(ozelmesajuyari); }
    if (message.channel.type !== 'dm') {
      const sunucubilgi = new Discord.MessageEmbed()
    .setAuthor('Bighearted ' + message.author.username + '  ordered coffee for everyone!')
    .setColor(3447003)
    .setTimestamp()
    .setDescription('')
		.setImage(`https://media1.giphy.com/media/3ohhwmVXkjdU4whvxe/giphy.gif?cid=790b7611e33f17014a68977691bb0750c80f84404bdfb2ae&rid=giphy.gif&ct=g`)
    return message.channel.send(sunucubilgi);
    }
};
exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: 0
};

exports.help = {
  name: 'coffe',
  description: 'Herkese Çay Verir',
  usage: 'coffe'
};