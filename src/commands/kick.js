const { PermissionsBitField } = require("discord.js");

module.exports = {
  name: "kick",
  async execute({ message }) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers))
      return message.reply("❌ Üye At yetkisi gerekli.");

    const target = message.mentions.members.first();
    if (!target) return message.reply("Kullanım: `p.kick @üye`");
    if (!target.kickable) return message.reply("❌ Bu üyeyi atamıyorum.");

    await target.kick(`PixoraX | ${message.author.tag}`);
    await message.reply(`👢 **${target.user.tag}** sunucudan atıldı.`);
  }
};