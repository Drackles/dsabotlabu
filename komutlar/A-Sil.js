const Discord = require("discord.js");

exports.run = async (yashinu, message, args) => {
  if (!message.member.hasPermission("MANAGE_MESSAGES"))
    return message.reply(
      `You must have "MANAGE MESSAGES" permission to use this command!`
    );
  if (!args[0] || isNaN(args[0]))
    return message.reply(
      `You must specify the amount of messages to be deleted! (as much as you want)`
    );
  message.delete();
  let Lrowsayi = Number(args[0]);
  let Lrowsilinen = 0;
  for (var i = 0; i < Math.floor(Lrowsayi / 100); i++) {
    message.channel.bulkDelete(100).then(r => (Lrowsilinen += r.size));
    Lrowsayi = Lrowsayi - 100;
  }
  if (Lrowsayi > 0)
    message.channel.bulkDelete(Lrowsayi).then(r => (Lrowsilinen += r.size));
  message.channel.send(
    new Discord.MessageEmbed()
      .setColor("#878484")
      .setDescription(
        `🗑 | **\`\`${
          args[0]
        }\`\` Number of Messages Deleted.**`
      )
  );
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: ["sil"],
  permLevel: 0
};

exports.help = {
  name: "sil",
  description: "Belirtilen miktarda mesajı siler.",
  usage: "sil"
};
