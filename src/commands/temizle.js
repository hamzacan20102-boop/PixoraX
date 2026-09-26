const { PermissionsBitField } = require("discord.js");

module.exports = {
  name: "temizle",
  async execute({ message, args }) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages))
      return message.reply("❌ Mesajları Yönet yetkisi gerekli.");

    const amount = Math.min(Math.max(parseInt(args[0]) || 10, 1), 100);
    const deleted = await message.channel.bulkDelete(amount, true);
    const msg = await message.channel.send(`🧹 ${deleted.size} mesaj silindi.`);
    setTimeout(() => msg.delete().catch(() => {}), 3000);
  }
};