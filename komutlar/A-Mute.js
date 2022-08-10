const Discord = require("discord.js");
const db = require("quick.db");
const client = new Discord.Client();
const ms = require("ms");
exports.run = async (client, message, args) => {
  function hata(mesaj) {
    let embed = new Discord.MessageEmbed()
      .setTitle("❌ Can't be.. Error!")
      .setColor("#00ff00")
      .setDescription(mesaj)
      .setFooter(
        client.user.username + " | Drackles Mute System",
        client.user.avatarURL()
      );
    return message.channel
      .send(embed)
      .then(codeming => codeming.delete({ timeout: 11000 }));
  }

  if (!message.member.permissions.has("ADMINISTRATOR"))
    return hata(
      "A user" ,
      "You must have **'ADMINISTRATOR'** privilege to mute."
    );

  let user =
    message.mentions.users.first() ||
    client.users.cache.get(args[0]) ||
    message.guild.members.cache.find(user => user.user.username === args[0]);
  let süre = args[1];
  let sebep = args.slice(2).join(" ");

  if (!user || user.bot)
    return hata(
      "You must specify the user you want to be muted. Example usage: **" +
        process.env.prefix +
        "mute @Drackles 1hours Spam**"
    );
  if (!süre)
    return hata(
      "You must specify how long you want the user to stay muted. Example usage: **" +
        process.env.prefix +
        "mute @Drackles 1hours Spam**"
    );
  if (!sebep) sebep = "No reason was entered!";

  let ms_süre;
  let dsüre;
  let eksüre;

  if (süre.includes("seconds")) {
    dsüre = dsüre = "s";
    eksüre = "seconds";
  }

  if (süre.includes("minutes")) {
    dsüre = dsüre = "m";
    eksüre = "minutes";
  }

  if (süre.includes("hours")) {
    dsüre = dsüre = "h";
    eksüre = "hours";
  }

  if (süre.includes("days")) {
    dsüre = dsüre = "d";
    eksüre = "days";
  }

  if (!dsüre)
    return hata(
      "The time format you specified is incorrect! **seconds, minutes, hours, days**"
    );

  ms_süre = süre.replace(eksüre, "");

  if (isNaN(ms_süre) || ms_süre < 1)
    return hata(
      "The time format you specified is incorrect! **1 second, 1 minute, 1 hour, 1 day**"
    );

  ms_süre = ms(ms_süre + dsüre);

  let mute_rol = message.guild.roles.cache.find(
    rol =>
      rol.name.toLowerCase().includes("muted") ||
      rol.name.toLowerCase().includes("muted")
  );

  if (!mute_rol) {
    message.guild.roles
      .create({
        data: {
          name: "Muted"
        }
      })
      .then(rol => {
        rol.setPermissions(0);
        message.guild.channels.cache.forEach(kanal => {
          kanal.updateOverwrite(rol, {
            SEND_MESSAGES: false,
            VIEW_CHANNEL: false
          });
        });
      });
  }

  let mute_rol2 = message.guild.roles.cache.find(
    rol =>
      rol.name.toLowerCase().includes("muted") ||
      rol.name.toLowerCase().includes("muted")
  );
  if (mute_rol2) {
    let member = message.guild.members.cache.get(user.id);

    if (member.roles.cache.has(mute_rol))
      return hata("This user already has a mute!");

    const moment = require("moment");
    moment.locale("tr");

    let tamam = new Discord.MessageEmbed()
      .setAuthor(message.author.username, message.author.avatarURL())
      .setTitle("✅ User muted!")
      .setDescription(
        "**" +
          user.username +
          "** User named; **" +
          moment(Date.now() - ms_süre).format("LLLL") +
          "** until date; **" +
          sebep +
          "** I was muted because of it!"
      )
      .setColor("#00ff00");
    message.channel.send(tamam);

    member.roles.add(mute_rol);
    db.set(`mute_${user.id}`, {
      kanal: message.channel.id,
      ms: ms_süre,
      başlangıç: Date.now(),
      sebep: sebep,
      moderator: message.author.id,
      sunucu: message.guild.id
    });
  } else {
    return message.channel.send(
      "Reuse the command; The bot has unlocked the **Muted** role on the server! If the role did not come; Make sure I have the necessary permissions."
    );
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ["mute"],
  permLevel: 0
};

exports.help = {
  name: "mute",
  description: "",
  usage: "mute"
};
