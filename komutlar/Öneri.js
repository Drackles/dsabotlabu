const Discord = require("discord.js"); ///modulumuzu tanittik
const db = require("quick.db");
exports.run = (client, message, args) => {
  let kanal = client.channels.cache.get(db.fetch(`ökanal_${message.guild.id}`));
  let p = db.fetch(`prefix_${message.guild.id}`) || process.env.prefix;

  let öneri = args.slice(0).join(" ");
  if (!kanal)
    return message.channel.send(
      "❌  The recommendationlog channel is not set. Please to set `" +
        p +
        "Use the suggestionlog #channel` command."
    );
  if (!öneri)
    return message.reply("❌  Please write your suggestion. ");
  if (öneri.length > 300)
    return message.reply(
      "❌ Your suggestion cannot exceed `300` characters."
    );
  if (öneri.length < 10)
    return message.reply(
      "❌  Your suggestion cannot be less than `10` characters."
    );
  let user = message.mentions.users.first();
  if (user)
    return message.reply(
      "❌  You cannot tag anyone in the suggestion command"
    );

  message.channel.send(
    "✅ Your suggestion has been forwarded to the log channel. "
  );
  let codeming = new Discord.MessageEmbed()
    .setThumbnail(message.author.avatarURL())
    .setFooter(message.author.username, client.user.avatarURL())
    .setTitle(" ⚡ | New Suggestion! ")
    .setDescription(
      `Recommender : ${message.author} ( ${message.author.id}) \n Suggestion : **${öneri}** `
    );
  kanal.send(codeming);
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permlevel: 0
};
exports.help = {
  name: "suggestion",
  despricton: "You are giving advice.",
  usage: "suggestion"
};
