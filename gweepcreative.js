const Discord = require("discord.js");
const client = new Discord.Client();
const chalk = require("chalk");
const moment = require("moment");
var Jimp = require("jimp");
const { Client, Util } = require("discord.js");
const fs = require("fs");
const replaceOnce = require("replace-once");
require("./util/eventLoader.js")(client);
const db = require("quick.db");
const queue = new Map();
const { Canvas } = require("canvas-constructor");
const YouTube = require("simple-youtube-api");
const superagent = require("superagent");
const ytdl = require("ytdl-core");
const ayarlar = require("./ayarlar.json");

var prefix = ayarlar.prefix;

const log = message => {
  console.log(`${message}`);
};

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
fs.readdir("./komutlar/", (err, files) => {
  if (err) console.error(err);
  log(`${files.length} komut yüklenecek.`);
  files.forEach(f => {
    let props = require(`./komutlar/${f}`);
    log(`Yüklenen komut: ${props.help.name}.`);
    client.commands.set(props.help.name, props);
    props.conf.aliases.forEach(alias => {
      client.aliases.set(alias, props.help.name);
    });
  });
});

client.reload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

client.load = command => {
  return new Promise((resolve, reject) => {
    try {
      let cmd = require(`./komutlar/${command}`);
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

client.unload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

client.elevation = message => {
  if (!message.guild) {
    return;
  }
  let permlvl = 0;
  if (message.member.hasPermission("BAN_MEMBERS")) permlvl = 2;
  if (message.member.hasPermission("ADMINISTRATOR")) permlvl = 3;
  if (message.author.id === process.env.sahip) permlvl = 4;
  return permlvl;
};

var regToken = /[\w\d]{24}\.[\w\d]{6}\.[\w\d-_]{27}/g;
// client.on('debug', e => {
//   console.log(chalk.bgBlue.green(e.replace(regToken, 'that was redacted')));
// });

client.on("warn", e => {
  console.log(chalk.bgYellow(e.replace(regToken, "that was redacted")));
});

client.on("error", e => {
  console.log(chalk.bgRed(e.replace(regToken, "that was redacted")));
});

client.login(ayarlar.token);

////-----------------------------\\\\\\\\\

//AFK Baş

const ms = require("parse-ms");
const { DiscordAPIError } = require("discord.js");

client.on("message", async message => {
  if (message.author.bot) return;
  if (!message.guild) return;
  if (message.content.includes(`afk`)) return;

  if (await db.fetch(`afk_${message.author.id}`)) {
    db.delete(`afk_${message.author.id}`);
    db.delete(`afk_süre_${message.author.id}`);

    const embed = new Discord.MessageEmbed()

      .setColor("#00ff00")
      .setAuthor(message.author.username, message.author.avatarURL)
      .setDescription(`${message.author.username} Artık \`AFK\` Değilsin.`);

    message.channel.send(embed);
  }

  var USER = message.mentions.users.first();
  if (!USER) return;
  var REASON = await db.fetch(`afk_${USER.id}`);

  if (REASON) {
    let süre = await db.fetch(`afk_süre_${USER.id}`);
    let timeObj = ms(Date.now() - süre);

    const afk = new Discord.MessageEmbed()

      .setColor("#00ff00")
      .setDescription(
        `**Bu Kullanıcı AFK**\n\n**Afk Olan Kullanıcı :** \`${USER.tag}\`\n**Afk Süresi :** \`${timeObj.hours}saat\` \`${timeObj.minutes}dakika\` \`${timeObj.seconds}saniye\`\n**Sebep :** \`${REASON}\``
      );

    message.channel.send(afk);
  }
});

//AFK Son

//ModLog Baş

client.on("messageDelete", async message => {
  if (message.author.bot || message.channel.type == "dm") return;

  let log = message.guild.channels.cache.get(
    await db.fetch(`log_${message.guild.id}`)
  );

  if (!log) return;

  const embed = new Discord.MessageEmbed()

    .setTitle(message.author.username + " | Mesaj Silindi")

    .addField("Kullanıcı: ", message.author)

    .addField("Kanal: ", message.channel)

    .addField("Mesaj: ", "" + message.content + "");

  log.send(embed);
});

client.on("messageUpdate", async (oldMessage, newMessage) => {
  let modlog = await db.fetch(`log_${oldMessage.guild.id}`);

  if (!modlog) return;

  let embed = new Discord.MessageEmbed()

    .setAuthor(oldMessage.author.username, oldMessage.author.avatarURL())

    .addField("**Eylem:**", "Mesaj Düzenleme")

    .addField(
      "**Mesajın sahibi:**",
      `<@${oldMessage.author.id}> === **${oldMessage.author.id}**`
    )

    .addField("**Eski Mesajı:**", `${oldMessage.content}`)

    .addField("**Yeni Mesajı:**", `${newMessage.content}`)

    .setTimestamp()

    .setColor("#00ff00")

    .setFooter(
      `Sunucu: ${oldMessage.guild.name} - ${oldMessage.guild.id}`,
      oldMessage.guild.iconURL()
    )

    .setThumbnail(oldMessage.guild.iconURL);

  client.channels.cache.get(modlog).send(embed);
});

client.on("channelCreate", async channel => {
  let modlog = await db.fetch(`log_${channel.guild.id}`);

  if (!modlog) return;

  const entry = await channel.guild
    .fetchAuditLogs({ type: "CHANNEL_CREATE" })
    .then(audit => audit.entries.first());

  let kanal;

  if (channel.type === "text") kanal = `<#${channel.id}>`;

  if (channel.type === "voice") kanal = `\`${channel.name}\``;

  let embed = new Discord.MessageEmbed()

    .setAuthor(entry.executor.username, entry.executor.avatarURL())

    .addField("**Eylem:**", "Kanal Oluşturma")

    .addField("**Kanalı Oluşturan Kişi:**", `<@${entry.executor.id}>`)

    .addField("**Oluşturduğu Kanal:**", `${kanal}`)

    .setTimestamp()

    .setColor("#00ff00")

    .setFooter(
      `Sunucu: ${channel.guild.name} - ${channel.guild.id}`,
      channel.guild.iconURL()
    )

    .setThumbnail(channel.guild.iconUR);

  client.channels.cache.get(modlog).send(embed);
});

client.on("channelDelete", async channel => {
  let modlog = await db.fetch(`log_${channel.guild.id}`);

  if (!modlog) return;

  const entry = await channel.guild
    .fetchAuditLogs({ type: "CHANNEL_DELETE" })
    .then(audit => audit.entries.first());

  let embed = new Discord.MessageEmbed()

    .setAuthor(entry.executor.username, entry.executor.avatarURL())

    .addField("**Eylem:**", "Kanal Silme")

    .addField("**Kanalı Silen Kişi:**", `<@${entry.executor.id}>`)

    .addField("**Silinen Kanal:**", `\`${channel.name}\``)

    .setTimestamp()

    .setColor("#00ff00")

    .setFooter(
      `Sunucu: ${channel.guild.name} - ${channel.guild.id}`,
      channel.guild.iconURL()
    )

    .setThumbnail(channel.guild.iconURL);

  client.channels.cache.get(modlog).send(embed);
});

client.on("roleCreate", async role => {
  let modlog = await db.fetch(`log_${role.guild.id}`);

  if (!modlog) return;

  const entry = await role.guild
    .fetchAuditLogs({ type: "ROLE_CREATE" })
    .then(audit => audit.entries.first());

  let embed = new Discord.MessageEmbed()

    .setAuthor(entry.executor.username, entry.executor.avatarURL())

    .addField("**Eylem:**", "Rol Oluşturma")

    .addField("**Rolü oluşturan kişi:**", `<@${entry.executor.id}>`)

    .addField("**Oluşturulan rol:**", `\`${role.name}\` **=** \`${role.id}\``)

    .setTimestamp()

    .setFooter(
      `Sunucu: ${role.guild.name} - ${role.guild.id}`,
      role.guild.iconURL
    )

    .setColor("#00ff00")

    .setThumbnail(role.guild.iconURL);

  client.channels.cache.get(modlog).send(embed);
});

client.on("roleDelete", async role => {
  let modlog = await db.fetch(`log_${role.guild.id}`);

  if (!modlog) return;

  const entry = await role.guild
    .fetchAuditLogs({ type: "ROLE_DELETE" })
    .then(audit => audit.entries.first());

  let embed = new Discord.MessageEmbed()

    .setAuthor(entry.executor.username, entry.executor.avatarURL())

    .addField("**Eylem:**", "Rol Silme")

    .addField("**Rolü silen kişi:**", `<@${entry.executor.id}>`)

    .addField("**Silinen rol:**", `\`${role.name}\` **=** \`${role.id}\``)

    .setTimestamp()

    .setFooter(
      `Sunucu: ${role.guild.name} - ${role.guild.id}`,
      role.guild.iconURL
    )

    .setColor("#00ff00")

    .setThumbnail(role.guild.iconURL);

  client.channels.cache.get(modlog).send(embed);
});

client.on("emojiCreate", async emoji => {
  let modlog = await db.fetch(`log_${emoji.guild.id}`);

  if (!modlog) return;

  const entry = await emoji.guild
    .fetchAuditLogs({ type: "EMOJI_CREATE" })
    .then(audit => audit.entries.first());

  let embed = new Discord.MessageEmbed()

    .setAuthor(entry.executor.username, entry.executor.avatarURL())

    .addField("**Eylem:**", "Emoji Oluşturma")

    .addField("**Emojiyi oluşturan kişi:**", `<@${entry.executor.id}>`)

    .addField("**Oluşturulan emoji:**", `${emoji} - İsmi: \`${emoji.name}\``)

    .setTimestamp()

    .setColor("#00ff00")

    .setFooter(
      `Sunucu: ${emoji.guild.name} - ${emoji.guild.id}`,
      emoji.guild.iconURL
    )

    .setThumbnail(emoji.guild.iconURL);

  client.channels.cache.get(modlog).send(embed);
});

client.on("emojiDelete", async emoji => {
  let modlog = await db.fetch(`log_${emoji.guild.id}`);

  if (!modlog) return;

  const entry = await emoji.guild
    .fetchAuditLogs({ type: "EMOJI_DELETE" })
    .then(audit => audit.entries.first());

  let embed = new Discord.MessageEmbed()

    .setAuthor(entry.executor.username, entry.executor.avatarURL())

    .addField("**Eylem:**", "Emoji Silme")

    .addField("**Emojiyi silen kişi:**", `<@${entry.executor.id}>`)

    .addField("**Silinen emoji:**", `${emoji}`)

    .setTimestamp()

    .setFooter(
      `Sunucu: ${emoji.guild.name} - ${emoji.guild.id}`,
      emoji.guild.iconURL
    )

    .setColor("#00ff00")

    .setThumbnail(emoji.guild.iconURL);

  client.channels.cache.get(modlog).send(embed);
});

client.on("emojiUpdate", async (oldEmoji, newEmoji) => {
  let modlog = await db.fetch(`log_${oldEmoji.guild.id}`);

  if (!modlog) return;

  const entry = await oldEmoji.guild
    .fetchAuditLogs({ type: "EMOJI_UPDATE" })
    .then(audit => audit.entries.first());

  let embed = new Discord.MessageEmbed()

    .setAuthor(entry.executor.username, entry.executor.avatarURL())

    .addField("**Eylem:**", "Emoji Güncelleme")

    .addField("**Emojiyi güncelleyen kişi:**", `<@${entry.executor.id}>`)

    .addField(
      "**Güncellenmeden önceki emoji:**",
      `${oldEmoji} - İsmi: \`${oldEmoji.name}\``
    )

    .addField(
      "**Güncellendikten sonraki emoji:**",
      `${newEmoji} - İsmi: \`${newEmoji.name}\``
    )

    .setTimestamp()

    .setColor("#00ff00")

    .setFooter(
      `Sunucu: ${oldEmoji.guild.name} - ${oldEmoji.guild.id}`,
      oldEmoji.guild.iconURL
    )

    .setThumbnail(oldEmoji.guild.iconURL);

  client.channels.cache.get(modlog).send(embed);
});

client.on("guildBanAdd", async (guild, user) => {
  let modlog = await db.fetch(`log_${guild.id}`);

  if (!modlog) return;

  const entry = await guild
    .fetchAuditLogs({ type: "MEMBER_BAN_ADD" })
    .then(audit => audit.entries.first());

  let embed = new Discord.MessageEmbed()

    .setAuthor(entry.executor.username, entry.executor.avatarURL())

    .addField("**Eylem:**", "Yasaklama")

    .addField("**Kullanıcıyı yasaklayan yetkili:**", `<@${entry.executor.id}>`)

    .addField("**Yasaklanan kullanıcı:**", `**${user.tag}** - ${user.id}`)

    .addField("**Yasaklanma sebebi:**", `${entry.reason}`)

    .setTimestamp()

    .setColor("#00ff00")

    .setFooter(`Sunucu: ${guild.name} - ${guild.id}`, guild.iconURL)

    .setThumbnail(guild.iconURL);

  client.channels.cache.get(modlog).send(embed);
});

client.on("guildBanRemove", async (guild, user) => {
  let modlog = await db.fetch(`log_${guild.id}`);

  if (!modlog) return;

  const entry = await guild
    .fetchAuditLogs({ type: "MEMBER_BAN_REMOVE" })
    .then(audit => audit.entries.first());

  let embed = new Discord.MessageEmbed()

    .setAuthor(entry.executor.username, entry.executor.avatarURL())

    .addField("**Eylem:**", "Yasak kaldırma")

    .addField("**Yasağı kaldıran yetkili:**", `<@${entry.executor.id}>`)

    .addField(
      "**Yasağı kaldırılan kullanıcı:**",
      `**${user.tag}** - ${user.id}`
    )

    .setTimestamp()

    .setColor("#00ff00")

    .setFooter(`Sunucu: ${guild.name} - ${guild.id}`, guild.iconURL)

    .setThumbnail(guild.iconURL);

  client.channels.cache.get(modlog).send(embed);
});
// ModLog Son

//KüfürEngel Baş

const küfür = [
  "siktir",
  "fuck",
  "puşt",
  "pust",
  "piç",
  "sikerim",
  "sik",
  "yarra",
  "yarrak",
  "amcık",
  "orospu",
  "orosbu",
  "orosbucocu",
  "oç",
  ".oc",
  "ibne",
  "yavşak",
  "bitch",
  "dalyarak",
  "amk",
  "awk",
  "taşak",
  "taşşak",
  "daşşak",
  "sikm",
  "sikim",
  "sikmm",
  "skim",
  "skm",
  "sg"
];
client.on("messageUpdate", async (old, nev) => {
  if (old.content != nev.content) {
    let i = await db.fetch(`küfür.${nev.member.guild.id}.durum`);
    let y = await db.fetch(`küfür.${nev.member.guild.id}.kanal`);
    if (i) {
      if (küfür.some(word => nev.content.includes(word))) {
        if (nev.member.hasPermission("BAN_MEMBERS")) return;
        //if (ayarlar.gelistiriciler.includes(nev.author.id)) return ;
        const embed = new Discord.MessageEmbed()
          .setColor("#00ff00")
          .setDescription(
            ` ${nev.author} , **Mesajını editleyerek küfür etmeye çalıştı!**`
          )
          .addField("Mesajı:", nev);

        nev.delete();
        const embeds = new Discord.MessageEmbed()
          .setColor("#00ff00")
          .setDescription(
            ` ${nev.author} , **Mesajı editleyerek küfür etmene izin veremem!**`
          );
        client.channels.cache.get(y).send(embed);
        nev.channel.send(embeds).then(msg => msg.delete({ timeout: 5000 }));
      }
    } else {
    }
    if (!i) return;
  }
});

client.on("message", async msg => {
  if (msg.author.bot) return;
  if (msg.channel.type === "dm") return;
  let y = await db.fetch(`küfür.${msg.member.guild.id}.kanal`);

  let i = await db.fetch(`küfür.${msg.member.guild.id}.durum`);
  if (i) {
    if (küfür.some(word => msg.content.toLowerCase().includes(word))) {
      try {
        if (!msg.member.hasPermission("MANAGE_GUILD")) {
          //  if (!ayarlar.gelistiriciler.includes(msg.author.id)) return ;
          msg.delete({ timeout: 750 });
          const embeds = new Discord.MessageEmbed()
            .setColor("#00ff00")
            .setDescription(
              ` <@${msg.author.id}> , **Bu sunucuda küfür yasak!**`
            );
          msg.channel.send(embeds).then(msg => msg.delete({ timeout: 5000 }));
          const embed = new Discord.MessageEmbed()
            .setColor("#00ff00")
            .setDescription(` ${msg.author} , **Küfür etmeye çalıştı!**`)
            .addField("Mesajı:", msg);
          client.channels.cache.get(y).send(embed);
        }
      } catch (err) {
        console.log(err);
      }
    }
  }
  if (!i) return;
});



//KüfürEngel Son

//Reklam Engel Baş

const reklam = [
  ".com",
  ".net",
  ".xyz",
  ".tk",
  ".pw",
  ".io",
  ".me",
  ".gg",
  "www.",
  "https",
  "http",
  ".gl",
  ".org",
  ".com.tr",
  ".biz",
  "net",
  ".rf",
  ".gd",
  ".az",
  ".party",
  ".gf",
  ".31"
];
client.on("messageUpdate", async (old, nev) => {
  if (old.content != nev.content) {
    let i = await db.fetch(`reklam.${nev.member.guild.id}.durum`);
    let y = await db.fetch(`reklam.${nev.member.guild.id}.kanal`);
    if (i) {
      if (reklam.some(word => nev.content.includes(word))) {
        if (nev.member.hasPermission("BAN_MEMBERS")) return;
        //if (ayarlar.gelistiriciler.includes(nev.author.id)) return ;
        const embed = new Discord.MessageEmbed()
          .setColor("#00ff00")
          .setDescription(
            ` ${nev.author} , **Mesajını editleyerek reklam yapmaya çalıştı!**`
          )
          .addField("Mesajı:", nev);

        nev.delete();
        const embeds = new Discord.MessageEmbed()
          .setColor("#00ff00")
          .setDescription(
            ` ${nev.author} , **Mesajı editleyerek reklam yapamana izin veremem!**`
          );
        client.channels.cache.get(y).send(embed);
        nev.channel.send(embeds).then(msg => msg.delete({ timeout: 5000 }));
      }
    } else {
    }
    if (!i) return;
  }
});

client.on("message", async msg => {
  if (msg.author.bot) return;
  if (msg.channel.type === "dm") return;
  let y = await db.fetch(`reklam.${msg.member.guild.id}.kanal`);

  let i = await db.fetch(`reklam.${msg.member.guild.id}.durum`);
  if (i) {
    if (reklam.some(word => msg.content.toLowerCase().includes(word))) {
      try {
        if (!msg.member.hasPermission("MANAGE_GUILD")) {
          //  if (!ayarlar.gelistiriciler.includes(msg.author.id)) return ;
          msg.delete({ timeout: 750 });
          const embeds = new Discord.MessageEmbed()
            .setColor("#00ff00")
            .setDescription(
              ` <@${msg.author.id}> , **Bu sunucuda reklam yapmak yasak!**`
            );
          msg.channel.send(embeds).then(msg => msg.delete({ timeout: 5000 }));
          const embed = new Discord.MessageEmbed()
            .setColor("#00ff00")
            .setDescription(` ${msg.author} , **Reklam yapmaya çalıştı!**`)
            .addField("Mesajı:", msg);
          client.channels.cache.get(y).send(embed);
        }
      } catch (err) {
        console.log(err);
      }
    }
  }
  if (!i) return;
});

//Reklam Engel Son

//OtoRol Baş

client.on("guildMemberAdd", async member => {
  let kanal = await db.fetch(`otoRK_${member.guild.id}`);
  let rol = await db.fetch(`otoRL_${member.guild.id}`);
  let mesaj = db.fetch(`otoRM_${member.guild.id}`);
  if (!rol) return;

  if (!mesaj) {
    client.channels.cache
      .get(kanal)
      .send(
        ":loudspeaker: :inbox_tray: Otomatik Rol Verildi Seninle Beraber `" +
          member.guild.memberCount +
          "` Kişiyiz! Hoşgeldin! `" +
          member.user.username +
          "`"
      );
    return member.roles.add(rol);
  }

  if (mesaj) {
    var mesajs = mesaj
      .replace("-uye-", `${member.user}`)
      .replace("-uyetag-", `${member.user.tag}`)
      .replace("-rol-", `${member.guild.roles.cache.get(rol).name}`)
      .replace("-server-", `${member.guild.name}`)
      .replace("-uyesayisi-", `${member.guild.memberCount}`)
      .replace(
        "-botsayisi-",
        `${member.guild.members.cache.filter(m => m.user.bot).size}`
      )
      .replace("-bolge-", `${member.guild.region}`)
      .replace("-kanalsayisi-", `${member.guild.channels.size}`);
    member.roles.add(rol);
    return client.channels.cache.get(kanal).send(mesajs);
  }
});

//OtORol Son

//Mute Sistem Baş

client.on("ready", async () => {
  setInterval(() => {
    let datalar = db.all().filter(data => data.ID.startsWith("mute_"));

    if (datalar.size < 0) return;

    datalar.forEach(datacık => {
      let kullanıcı = datacık.ID.replace("mute_", "");
      let data = db.fetch(`mute_${kullanıcı}`);

      let süre = data.ms - (Date.now() - data.başlangıç);

      let sunucu = client.guilds.cache.get(data.sunucu);
      let member = sunucu.members.cache.get(kullanıcı);
      let kanal = sunucu.channels.cache.get(data.kanal);
      let sebep = data.sebep;
      let moderator = client.users.cache.get(data.moderator);
      let mute_rol = sunucu.roles.cache.find(
        rol =>
          rol.name.toLowerCase().includes("muted") ||
          rol.name.toLowerCase().includes("muted")
      );

      if (!member) {
        let hata = new Discord.MessageEmbed()
          .setTitle("Mute Couldn't Continue!")
          .setDescription(
            "**" +
              kullanıcı +
              "** has ID; **" +
              moderator.username +
              "** User muted by **" +
              sunucu.name +
              "** left the server.!"
          )
          .setColor("RED");
        kanal.send("<@!" + moderator.id + ">", hata);
        db.delete(datacık.ID);

        return;
      }

      if (süre > 0) return;

      let bitti = new Discord.MessageEmbed()
        .setTitle(":hammer_pick: Mute Removed!")
        .setDescription(
          "The mute of the following user; Terminated for **Expired**!"
        )
        .addField("\u200b", "\u200b")
        .addField(
          ":bust_in_silhouette: __USER__ :bust_in_silhouette:",
          "» User: **" +
            member.user.username +
            "**\n» Reason for Muted: **" +
            sebep +
            "**\n» ID: **" +
            member.user.id +
            "**"
        )
        .addField("\u200b", "\u200b")
        .addField(
          ":maple_leaf: __Moderator__ :maple_leaf:",
          "» Moderator: **" +
            moderator.username +
            "**\n» ID: **" +
            moderator.id +
            "**"
        )
        .setColor("GREEN");
      kanal.send(
        "<@!" + member.user.id + "> , <@!" + moderator.id + ">",
        bitti
      );

      member.roles.remove(mute_rol);
      db.delete(datacık.ID);
    });
  }, 5000);
});

//Mute Sistem Son

//Kelime Türetmece Baş

client.on("message", async message => {
  if (message.author.id === client.user.id) return;
  let kanal = "";
  if (message.channel.id !== kanal) return;

  let kelime = await db.fetch(`kelime`);

  if (message.author.id === db.fetch(`kelime-sahip`)) {
    message.delete({ timeout: 100, reason: "ce" });
    message
      .reply(
        " En son kelimeyi sen **yazmışsın**, başkasının oyuna katılmasını bekle."
      )
      .then(s => s.delete({ timeout: 5000, reason: "s" }));
    return;
  }

  if (!kelime) {
    message.react("<:kabulet:822545421628342312>");
    db.set(`kelime`, message.content.substr(-1));
    db.set(`kelime-sahip`, message.author.id);
    return;
  }

  if (!message.content.toLowerCase().startsWith(kelime)) {
    message.delete({ timeout: 100, reason: "ce" });
    message
      .reply(" Yeni kelime **" + kelime + "** harfi ile başlamalıdır.")
      .then(s => s.delete({ timeout: 5000, reason: "s" }));
    return;
  }

  message.react(":kabulet:822545421628342312>");
  db.set(`kelime`, message.content.substr(-1));
  db.set(`kelime-sahip`, message.author.id);
});

//Kelime Türetmece Son

//Sayı Sayma Baş

client.on("message", async message => {
  if (message.author.id === client.user.id) return;
  let sayıcık = await db.fetch(`sayı`);
  if (!sayıcık) sayıcık = 1;
  let sayı = sayıcık.toString();
  let kanal = "";
  if (message.channel.id !== kanal) return;

  if (message.author.id === db.fetch(`sayı-sahip`)) {
    message.delete({ timeout: 100, reason: "ce" });
    message
      .reply(
        " En son sayıyı sen yazmışsın, başkasının oyuna katılmasını bekle."
      )
      .then(s => s.delete({ timeout: 5000, reason: "s" }));
    return;
  }

  if (isNaN(message.content)) {
    message.delete({ timeout: 100, reason: "ce" });

    message
      .reply(" Sadece sayı girebilirsin.")
      .then(s => s.delete({ timeout: 5000, reason: "s" }));
    return;
  }

  if (message.content !== sayı) {
    message.delete({ timeout: 100, reason: "ce" });
    message
      .reply(" Lütfen bir sonraki sayıyı gir. Bir sonraki sayı; " + sayı)
      .then(s => s.delete({ timeout: 5000, reason: "s" }));

    let ce = Number(message.content);
    db.set(`sayı`, ce + 1);
    db.set(`sayı-sahip`, message.author.id);
    return;
  }
});

//Sayı Sayma Son

//StarBoard Baş

function extension(attachment) {
  // can#0002
  let imageLink = attachment.split(".");
  let typeOfImage = imageLink[imageLink.length - 1];
  let image = /(jpg|jpeg|png|gif)/gi.test(typeOfImage);
  if (!image) return "";
  return attachment;
} // codare ♥

client.on("messageReactionAdd", async (messageReaction, user) => {
  // can#0002
  if (user.bot) return;
  const database = require("quick.db");

  if (messageReaction.emoji.name === "⭐") {
    /*if(messageReaction.count <= 1) return;*/

    let starboardChannel = client.channels.cache.get(""); // id gir
    if (!starboardChannel) return;

    if (messageReaction.message.content == null)
      return user.send("You added a reaction to an old message.");

    let emojiCheck;
    let color;
    if (messageReaction.count <= 7) {
      emojiCheck = "⭐";
      color = "#ffdf81";
    }
    if (messageReaction.count >= 8) {
      emojiCheck = "🌟";
      color = "#ffd65e";
    }
    if (messageReaction.count >= 14) {
      emojiCheck = "✨";
      color = "#ffc827";
    }
    if (messageReaction.count >= 24) {
      emojiCheck = "💫";
      color = "#ffc20c";
    }
    if (messageReaction.count >= 32) {
      emojiCheck = "☄️";
      color = "#ffc20c";
    }

    const embed = new Discord.MessageEmbed()
      .setDescription(messageReaction.message.content)
      .setFooter("ID: " + messageReaction.message.id)
      .setTimestamp()
      .setColor(color)
      .setAuthor(
        messageReaction.message.author.tag,
        messageReaction.message.author.displayAvatarURL({ dynamic: true })
      );

    let image =
      messageReaction.message.attachments.size > 0
        ? await extension(messageReaction.message.attachments.array()[0].url)
        : "";
    if (image) embed.setImage(image);

    const gönderildi = await database.fetch(messageReaction.message.id);
    if (gönderildi) {
      const messageFetch = await starboardChannel.messages.fetch(gönderildi);
      messageFetch.edit(
        `${emojiCheck || "⭐"} **${messageReaction.count}** | ${
          messageReaction.message.channel
        }`,
        embed
      );
    } else {
      starboardChannel
        .send(
          `${emojiCheck || "⭐"} **${messageReaction.count}** | ${
            messageReaction.message.channel
          }`,
          embed
        )
        .then(asd => {
          database.set(messageReaction.message.id, asd.id);
          asd.react("⭐");
        });
    }
  }
}); // codare ♥

client.on("messageReactionRemove", async (messageReaction, user) => {
  // can#0002
  if (user.bot) return;
  const database = require("quick.db");

  if (messageReaction.emoji.name === "⭐") {
    let starboardChannel = client.channels.cache.get(""); // id gir
    if (!starboardChannel) return;

    if (messageReaction.message.content == null)
      return user.send("You added a reaction to an old message.");
    if (messageReaction.count == 0) {
      const ms = await database.fetch(messageReaction.message.id);
      const öd = await starboardChannel.messages.fetch(ms);
      öd.delete();
      database.delete(messageReaction.message.id);
    }

    let emojiCheck;
    let color;
    if (messageReaction.count <= 7) {
      emojiCheck = "⭐";
      color = "#ffdf81";
    }
    if (messageReaction.count >= 8) {
      emojiCheck = "🌟";
      color = "#ffd65e";
    }
    if (messageReaction.count >= 14) {
      emojiCheck = "✨";
      color = "#ffc827";
    }
    if (messageReaction.count >= 24) {
      emojiCheck = "💫";
      color = "#ffc20c";
    }
    if (messageReaction.count >= 32) {
      emojiCheck = "☄️";
      color = "#ffc20c";
    }

    const embed = new Discord.MessageEmbed()
      .setDescription(messageReaction.message.content)
      .setFooter("ID: " + messageReaction.message.id)
      .setTimestamp()
      .setColor(color)
      .setAuthor(
        messageReaction.message.author.tag,
        messageReaction.message.author.displayAvatarURL({ dynamic: true })
      );

    let image =
      messageReaction.message.attachments.size > 0
        ? await extension(messageReaction.message.attachments.array()[0].url)
        : "";
    if (image) embed.setImage(image);

    const gönderildi = await database.fetch(messageReaction.message.id);
    if (gönderildi) {
      const messageFetch = await starboardChannel.messages.fetch(gönderildi);
      messageFetch.edit(
        `${emojiCheck || "⭐"} **${messageReaction.count}** | ${
          messageReaction.message.channel
        }`,
        embed
      );
    }
  }
});

//StarBoard Son

//Seviye Sistem Baş

client.on("message", async message => {
  if (message.author.bot) return;

  let {
    status,
    ranks,
    logChannel,
    logRewardMessage,
    logUpMessage,
    blockChannels,
    blockRoles,
    reqXp
  } = (await db.fetch(`levelSystem_${message.guild.id}`)) || {
    status: false,
    reqXp: 3
  };
  if (!reqXp) reqXp = 50;

  if (status) {
    if (blockChannels && blockChannels.includes(message.channel.id)) return;
    if (
      blockRoles &&
      message.member.roles.cache.find(r => blockRoles.includes(r.id))
    )
      return;

    const { level, xp } = db.add(
      `levelProfile_${message.guild.id}_${message.author.id}.xp`,
      ((parseInt(message.content.length / 10, 10) + 1) * 10)
        .toString()
        .charAt(0)
    );

    if (xp >= reqXp) {
      db.set(`levelProfile_${message.guild.id}_${message.author.id}.xp`, 0);

      const { level, xp } = db.add(
        `levelProfile_${message.guild.id}_${message.author.id}.level`,
        +1
      );
      logChannel = logChannel
        ? message.guild.channels.cache.get(logChannel)
        : message.channel;

      if (!logUpMessage) logUpMessage = "seviye atladın yeni seviyen {level}";

      await logChannel.send(
        replaceOnce(
          logUpMessage,
          ["{user}", "{level}"],
          [message.member, level]
        )
      );

      const data = ranks ? ranks.find(x => x.level === `${level}`) : null;

      if (data) {
        if (!logRewardMessage)
          logRewardMessage =
            "seviye atladın ve yeni seviyen {level} aldığın seviye rolü {roleName}";

        try {
          await message.member.roles.add(data.roleId);
          await logChannel.send(
            replaceOnce(
              logRewardMessage,
              ["{user}", "{level}", "{roleName}"],
              [
                message.member,
                level,
                message.guild.roles.cache.get(data.roleId).name
              ]
            )
          );
        } catch (err) {
          await message.guild.owner.send(
            `${data.roleId}'ıd li rol olmadığı için ${message.member} adlı kişiye rolü veremedim.`
          );
        }
      }
    }
  }
});

//Seviye Sistem Son


//Güvenlik Baş

client.on("guildMemberAdd", member => {
  let kanal = db.fetch(`staff-chat.${member.guild.id}`);
  if (!kanal) return;

  let aylar = {
    "01": "January",
    "02": "February",
    "03": "March",
    "04": "April",
    "05": "May",
    "06": "June",
    "07": "July",
    "08": "August",
    "09": "September",
    "10": "October",
    "11": "November",
    "12": "December"
  };

  let bitiş = member.user.createdAt;
  let günü = moment(new Date(bitiş).toISOString()).format("DD");
  let ayı = moment(new Date(bitiş).toISOString())
    .format("MM")
    .replace("01", "January")
    .replace("02", "February")
    .replace("03", "March")
    .replace("04", "April")
    .replace("05", "May")
    .replace("06", "June")
    .replace("07", "July")
    .replace("08", "August")
    .replace("09", "September")
    .replace("10", "October")
    .replace("11", "November")
    .replace("12", "December")
    .replace("13", "CodAre");
  let yılı = moment(new Date(bitiş).toISOString()).format("YYYY");
  let saati = moment(new Date(bitiş).toISOString()).format("HH:mm");

  let günay = `${günü} ${ayı} ${yılı} ${saati}`;

  let süre = member.user.createdAt;
  let gün = moment(new Date(süre).toISOString()).format("DD");
  let week = moment(new Date(süre).toISOString()).format("WW");
  let month = moment(new Date(süre).toISOString()).format("MM");
  let ayy = moment(new Date(süre).toISOString()).format("MM");
  let year = moment(new Date(süre).toISOString()).format("YYYY");
  let yıl2 = moment(new Date().toISOString()).format("YYYY");

  let netyıl = yıl2 - year;

  let created = ` ${netyıl} year  ${month} month ${week} week ${gün} days ago`;

  let kontrol;
  if (süre < 1296000000)
    kontrol = "`Bu hesap şüpheli!` <:alarm:823928423474397205>";
  if (süre > 1296000000)
    kontrol = "`Bu hesap güvenli!` <:okey:822549962532847676>";

  let codare = new Discord.MessageEmbed()
    .setColor("#00ff00")
    .setTitle(`${member.user.username} Katıldı`)
    .setDescription(
      "<@" +
        member.id +
        "> Bilgileri <:sag:822547800481988628> \n\n  __Hesap Oluşturulma Tarihi__ <:sag:822547800481988628> \n\n**[" +
        created +
        "]** (`" +
        günay +
        "`) \n\n __Hesap durumu__ <:sag:822547800481988628> \n\n**" +
        kontrol +
        "**"
    );
  client.channels.cache.get(kanal).send(codare);
});





//DM HG Baş

client.on("guildMemberAdd", member => {
  const hosgeldin = new Discord.MessageEmbed()
    .setThumbnail(
      "https://media.discordapp.net/attachments/319424398799011841/1000512297397133372/anim2.gif"
    )
     .setAuthor(`Welcome to the DSA discord server!`)
    .setDescription("Make sure you go through the CIT & Group rules.")
   .setColor("#6B6A6A")
    .addField("**if you don't follow the rules**", "You will be punished!")
    .addField(
      "**Board Link**",
      "[Detective Service Agency ](https://cit.gg/index.php?board=1322.0)"
    )
  member.send(hosgeldin);
});

//DM HG Son
const { GiveawaysManager } = require('discord-giveaways');
client.giveawaysManager = new GiveawaysManager(client, {
    storage: "./db.json",
    updateCountdownEvery: 3000,
    default: {
        botsCanWin: false,
        embedColor: "#FF0000",
        reaction: "🎉"
    }
});




client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
fs.readdir("./komutlar/", (err, files) => {
  if (err) console.error(err);
  log(`${files.length} komut yüklenecek.`);
  files.forEach(f => {
    let props = require(`./komutlar/${f}`);
    log(`Yüklenen komut: ${props.help.name}.`);
    client.commands.set(props.help.name, props);
    props.conf.aliases.forEach(alias => {
      client.aliases.set(alias, props.help.name);
    });
  });
});
client.reload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};
client.load = command => {
  return new Promise((resolve, reject) => {
    try {
      let cmd = require(`./komutlar/${command}`);
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};
client.unload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

client.on('ready', () => {

  // Oynuyor Kısmı
  
      var actvs = [
        `${prefix}Drackles`
    ];
    
    client.user.setActivity(actvs[Math.floor(Math.random() * (actvs.length - 1) + 1)], { type: 'LISTENING' });
    setInterval(() => {
        client.user.setActivity(actvs[Math.floor(Math.random() * (actvs.length - 1) + 1)], { type: 'LISTENING'});
    }, 15000);
    
  
      console.log ('_________________________________________');
      console.log (`Kullanıcı İsmi     : ${client.user.username}`);
      console.log (`Sunucular          : ${client.guilds.cache.size}`);
      console.log (`Kullanıcılar       : ${client.users.cache.size}`);
      console.log (`Prefix             : ${ayarlar.prefix}`);
      console.log (`Durum              : Bot Çevrimiçi!`);
      console.log ('_________________________________________');
    
    });









// AYRILMA YERİ AYRILMA YERİ

const { MessageActionRow, MessageButton } = require('discord.js');

client.on('messageCreate', async message => {

	if (message.content === '!djrole') {
    let kisi = message.member
		const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('primary')
					.setLabel('DJ')
					.setStyle('PRIMARY'),
        new MessageButton()
					.setCustomId('danger')
					.setLabel('DJ')
					.setStyle('DANGER'),
			);

		await message.reply({ content: 'Take the role of DJ below to become a DJ!', components: [row] });
	const collector = message.channel.createMessageComponentCollector({ time: 15000 });

collector.on('collect', async i => {
	if (i.customId === 'primary') {
		await i.update({ content: 'The role of DJ was successfully given.', components: [] });
    kisi.roles.add("1002751461115052052")
	}
  	if (i.customId === 'danger') {
		await i.update({ content: 'The role of DJ was successfully given.', components: [] });
    kisi.roles.add("1002751461115052052")
	}
});
  }
});


//her mesaja tepki kanalda#discordbotupdateDSA
client.on("message", message => {

if(message.channel.id === "1001201975754494053"){
message.react("☑️")
}
})
//hermesaja tepki



