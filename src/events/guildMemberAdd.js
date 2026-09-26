const { EmbedBuilder } = require("discord.js");
const config = require("../config");

module.exports.handleMemberAdd = async (client, member) => {
  try {
    const role = member.guild.roles.cache.find(r => r.name === "👤・Üye");
    if (role) await member.roles.add(role);

    const embed = new EmbedBuilder()
      .setTitle("👋 Hoş geldin!")
      .setDescription(`**${member.user.username}**, ${member.guild.name} sunucusuna hoş geldin!`)
      .setThumbnail(member.user.displayAvatarURL())
      .setTimestamp();

    const channel =
      (config.welcomeChannelId && member.guild.channels.cache.get(config.welcomeChannelId)) ||
      member.guild.channels.cache.find(c => c.name === "👋・hoş-geldin");

    if (channel) await channel.send({ embeds: [embed] });

    if (config.autoDm) {
      await member.send({
        embeds: [
          new EmbedBuilder()
            .setTitle("🎉 PixoraX'e hoş geldin!")
            .setDescription(`**${member.guild.name}** sunucusuna katıldığın için teşekkürler.\nKurallar ve kanalları kontrol etmeyi unutma.`)
            .setTimestamp()
        ]
      });
    }
  } catch (e) {
    console.log("guildMemberAdd:", e.message);
  }
};