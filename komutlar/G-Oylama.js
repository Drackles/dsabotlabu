const Discord = require("discord.js");
const fs = require("fs");
const db = require("quick.db");
const ayarlar = require("../ayarlar.json");
let prefix = ayarlar.prefix;

module.exports.run = async (client, message, args) => {
  if (!message.member.hasPermission("ADMINISTRATOR"))
    return message.channel.send(
      new Discord.MessageEmbed()
        .setColor("RANDOM")
        .setDescription(
          "You must have `Administrator` privilege to use this Command."
        )
    );

  let d = await db.fetch(`okanal_${message.guild.id}`);
  const sea = message.guild.channels.cache.get(d);
  if (!sea)
    return message.channel.send(
      new Discord.MessageEmbed()
        .setColor("RANDOM")
        .setDescription(
          `<a:unlem:822546045706698763> Voting Channel Not Set. \nTo set \`${prefix}voting-channel #channel\``
        )
    );

  let yazi = args.slice(0).join(" ");
  if (!yazi) return message.channel.send("Please Write What Will Happen in the Vote!");
  message.channel.send(`Vote has been sent. sent channel: <#${d}>`);
  const embed = new Discord.MessageEmbed()
    .setColor("RANDOM")
    .addField("__Voting Available!__", `**${yazi}**`)
    .setThumbnail(
      `https://media.discordapp.net/attachments/319424398799011841/1000512297397133372/anim2.gif`
    )
    .setFooter(`${message.author.username} voting started.`)
    .setAuthor(`${client.user.username} Voting`);
  sea.send("||@DSA Detectives Members|| ||@here||", { embed: embed }).then(m => {
    let re = m.react("✅");
    let ra = m.react("❌");
  });
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ["voting-vote", "voting-vote", "vote"],
  permLevel: 2,
  kategori: "yetkili"
};

exports.help = {
  name: "voting",
  description: "Bulunduğunuz kanala oylama yapar.",
  usage: "voting"
};
