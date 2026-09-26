const { EmbedBuilder } = require("discord.js");
const config = require("../config");
const { hasConsent, listConsentingUsers } = require("../utils/dmConsentStore");

const MAX_RECIPIENTS = 50;
const SEND_INTERVAL_MS = 1_100;

function wait(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

module.exports = {
  name: "topludm",
  aliases: ["dmduyuru"],
  async execute({ message, args }) {
    if (!config.ownerId || message.author.id !== config.ownerId) {
      return message.reply("❌ Bu komut yalnızca bot sahibine açıktır.");
    }
    if (!message.guild) return message.reply("❌ Bu komut yalnızca sunucuda kullanılabilir.");

    const text = args.join(" ").trim();
    if (!text || text.length > 3500) {
      return message.reply(`Kullanım: \`${config.prefix}topludm <mesaj>\` (en fazla 3500 karakter)`);
    }

    const recipients = listConsentingUsers(message.guild.id)
      .filter(userId => userId !== message.author.id)
      .slice(0, MAX_RECIPIENTS);

    if (recipients.length === 0) {
      return message.reply("📭 Bu sunucuda DM duyurularına izin vermiş üye yok.");
    }

    const status = await message.reply(`📨 İzin veren üyelere duyuru gönderiliyor: **0/${recipients.length}**`);
    const announcement = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("📢 Sunucu Duyurusu")
      .setDescription(text)
      .setFooter({ text: `${message.guild.name} • DM'leri kapatmak için p.dmizin kapat` })
      .setTimestamp();

    let sent = 0;
    let skipped = 0;

    for (const userId of recipients) {
      if (!hasConsent(message.guild.id, userId)) {
        skipped++;
        continue;
      }

      try {
        const member = await message.guild.members.fetch(userId);
        if (!hasConsent(message.guild.id, userId)) {
          skipped++;
          continue;
        }

        await member.send({
          embeds: [announcement],
          allowedMentions: { parse: [] }
        });
        sent++;
      } catch {
        skipped++;
      }

      if (sent + skipped < recipients.length) await wait(SEND_INTERVAL_MS);
    }

    const remaining = Math.max(0, listConsentingUsers(message.guild.id).length - recipients.length);
    const result = new EmbedBuilder()
      .setColor(skipped ? 0xf1c40f : 0x2ecc71)
      .setTitle("📬 DM Duyurusu Tamamlandı")
      .setDescription(
        `✅ Gönderildi: **${sent}**\n` +
        `⚠️ Atlandı/DM kapalı: **${skipped}**\n` +
        (remaining ? `📦 Sonraki komutta bekleyen izinli üye: **${remaining}**` : "")
      )
      .setTimestamp();

    return status.edit({ content: null, embeds: [result] });
  }
};
