const Discord = require('discord.js')
exports.run = (client, message, args) => {
  
    const drackles = new Discord.MessageEmbed()
    .setTitle("Information about Brodax")
   .setAuthor("Detective Service", "https://i.pinimg.com/originals/91/7c/69/917c699193ef499c592f248e3b7c0e72.gif")
    .setThumbnail('https://cdn.discordapp.com/attachments/319424398799011841/1001936819958579230/drck.png')
    .setColor("GRAY")
    .setDescription("**Who is Brodax?**\n   SOON")
    .setTimestamp()
    .setFooter(`Short introduction of Brodax and DSA.`, "https://media.discordapp.net/attachments/319424398799011841/1000512297397133372/anim2.gif")
    .addFields(
		{ name: '**Also Greetings From Brodax!**', value: 'Trust and dont worry. We are with you even if you dont know.' },
	)
    
    
    .setImage(
        `https://c.tenor.com/Bhk6i34XX9IAAAAC/georgia-state-patrol-car.gif`
      
        );
    return message.channel.send(drackles);
  message.channel.send(drackles)
    }

  




exports.conf = {
  aliases: ['yeni']
};

exports.help = {
  name: 'brodax'
  
};