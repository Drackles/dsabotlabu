const Discord = require("discord.js");
const db = require("quick.db");

exports.run = (client, message, args) => {
  let miran = args[0];

  let kanal = message.mentions.channels.first();

  let x;
  if (miran === "set") x = ".";
  if (miran === "reset") x = ".";
  if (!x)
    return message.reply(
      "❌ Please **set** or **reset** write."
    );

  if (miran === "set") {
    if (!kanal)
      message.channel.send(
        "❌ You must specify a channel."
      );
    db.set(`ökanal_${message.guild.id}`, kanal.id);
    return message.channel.send(
      "✅ Recommendation log channel successfully **" +
        kanal +
        "** set to"
    );
  }
  if (miran === "reset") db.delete(`ökanal_${message.guild.id}`);
  return message.channel.send(
    "✅ The recommendationlog channel has been reset."
  );
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ["suggestion-log"],
  permlevel: 4
};
exports.help = {
  name: "suggestionlog",
  despricton: "explanation",
  usage: "suggestionlog"
};
