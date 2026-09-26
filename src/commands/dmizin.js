const { EmbedBuilder } = require("discord.js");
const config = require("../config");
const { hasConsent, setConsent } = require("../utils/dmConsentStore");

module.exports = {
  name: "dmizin",
  aliases: ["dm-izin"],
  async execute({ message, args }) {
    if (!message.guild) return message.reply("❌ Bu komut yalnızca sunucuda kullanılabilir.");

    const action = (args[0] || "").toLocaleLowerCase("tr-TR");
    if (!["aç", "ac", "kapat"].includes(action)) {
      const current = hasConsent(message.guild.id, message.author.id) ? "açık" : "kapalı";
      return message.reply(`DM duyuru tercihin şu an **${current}**. Değiştirmek için \`${config.prefix}dmizin aç\` veya \`${config.prefix}dmizin kapat\` yaz.`);
    }

    const enabled = action !== "kapat";
    setConsent(message.guild.id, message.author.id, enabled);
    const embed = new EmbedBuilder()
      .setColor(enabled ? 0x2ecc71 : 0x95a5a6)
      .setTitle(enabled ? "🔔 DM Duyuruları Açık" : "🔕 DM Duyuruları Kapalı")
      .setDescription(enabled
        ? `Bu sunucunun sahibinden isteğe bağlı duyuruları DM olarak almayı kabul ettin. İstediğin zaman \`${config.prefix}dmizin kapat\` ile vazgeçebilirsin.`
        : `Bu sunucunun toplu DM duyurularından çıkarıldın. İstediğin zaman \`${config.prefix}dmizin aç\` ile yeniden katılabilirsin.`)
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }
};
