const { PermissionsBitField } = require("discord.js");

module.exports = {
  name: "ban",
  async execute({ message }) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers))
      return message.reply("❌ Üye Yasakla yetkisi gerekli.");

    const target = message.mentions.members.first();
    if (!target) return message.reply("Kullanım: `p.ban @üye`");
    if (!target.bannable) return message.reply("❌ Bu üyeyi yasaklayamıyorum.");

    await target.ban({ reason: `PixoraX | ${message.author.tag}` });
    await message.reply(`🔨 **${target.user.tag}** yasaklandı.`);
  }
};