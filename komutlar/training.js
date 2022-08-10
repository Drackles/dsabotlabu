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
    
    
      .setDescription(`${message.author.username} **Hadi beyler antrenman var! <@&1001582642199810158>** ⚽`)
      .setColor("BLACK")
      .setFooter(
        `${message.author.username} Burnova 1881`,
        userinfo.avatar
      )
      .setImage(
        
        `https://c.tenor.com/kcLW9iKfHTEAAAAd/fatih-terim-sofianemelo.gif`
        
        
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
  name: "burnovaant",
  description: "Polisi Arar (ciddiye almayın)",
  usage: "burnovaant"
};

