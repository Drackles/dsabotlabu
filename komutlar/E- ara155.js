const Discord = require("discord.js");
const ayarlar = require("../ayarlar.json");

exports.run = (client, message, params) => {
  let user = message.mentions.users.first() || message.author;

  let userinfo = {};
  userinfo.avatar = user.avatarURL();
  if (!message.guild) {
    const ozelmesajuyari = new Discord.MessageEmbed()
      .setColor("BLACK")
      .setAuthor(message.author.username, message.author.avatarURL())
      .addField("**Fun Commands Cannot Be Used in Private Messages!**");
    return message.author.send(ozelmesajuyari);
  }
  if (message.channel.type !== "dm") {
    const sunucubilgi = new Discord.MessageEmbed()
      .setDescription(`${message.author.username} **DSA is Coming!** 👮🏽‍♂️`)
      .setColor("BLACK")
      .setFooter(
        `${message.author.username} requested by.`,
        userinfo.avatar
      )
      .setImage(
        `https://c.tenor.com/fgmiy4IUH3MAAAAd/police-cars-police.gif`
      );
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
  name: "calldsa",
  description: "Polisi Arar (ciddiye almayın)",
  usage: "calldsa"
};
