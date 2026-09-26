const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "kart",
  async execute({ message }) {
    const user = message.author;
    const embed = new EmbedBuilder()
      .setTitle(`🃏 ${user.username} Kartı`)
      .setThumbnail(user.displayAvatarURL())
      .addFields(
        { name: "👤 Kullanıcı", value: `${user}`, inline: true },
        { name: "🆔 ID", value: user.id, inline: true },
        { name: "📅 Hesap", value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
        { name: "🏠 Sunucu", value: message.guild.name, inline: true },
        { name: "🎖️ Roller", value: `${message.member.roles.cache.filter(r => r.id !== message.guild.id).size}`, inline: true }
      )
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
};