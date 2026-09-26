const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: "duyuru",
  async execute({ message, args }) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages))
      return message.reply("❌ Bu komut için Mesajları Yönet yetkisi gerekli.");

    const text = args.join(" ");
    if (!text) return message.reply("Kullanım: `p.duyuru mesaj`");

    const embed = new EmbedBuilder()
      .setTitle("📢 Duyuru")
      .setDescription(text)
      .setFooter({ text: `Duyuran: ${message.author.username}` })
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });
  }
};