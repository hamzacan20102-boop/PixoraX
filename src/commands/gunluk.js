const { EmbedBuilder } = require("discord.js");
const { DAILY_REWARD, claimDaily, formatDuration, formatMoney } = require("../utils/economyStore");

module.exports = {
  name: "günlük",
  aliases: ["gunluk", "daily"],
  async execute({ message }) {
    const now = Date.now();
    const result = claimDaily(message.author.id, now);

    if (!result.claimed) {
      const nextClaim = Math.ceil((now + result.remainingMs) / 1000);
      return message.reply(`⏳ Günlük ödülünü tekrar almak için <t:${nextClaim}:R> bekle.`);
    }

    const embed = new EmbedBuilder()
      .setColor(0xf1c40f)
      .setTitle("🌤️ Günlük Ödül")
      .setDescription(
        `${message.author}, hesabına **${formatMoney(DAILY_REWARD)}** yatırıldı.\n` +
        `Yeni bakiyen: **${formatMoney(result.balance)}**`
      )
      .setFooter({ text: "Günlük ödül 24 saatte bir alınabilir." })
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }
};