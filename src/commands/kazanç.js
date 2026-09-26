const { EmbedBuilder } = require("discord.js");
const { collectBusinessIncome, formatDuration, formatMoney } = require("../utils/economyStore");

module.exports = {
  name: "kazanç",
  aliases: ["kazanc", "gelir", "profits"],
  async execute({ message }) {
    const result = collectBusinessIncome(message.author.id);

    if (!result.collected && result.reason === "no-business") {
      return message.reply("🏬 Henüz işyerin yok. `p.market işyerleri` ile bir işletme satın alabilirsin.");
    }

    if (!result.collected) {
      const claimAt = Math.ceil((Date.now() + result.remainingMs) / 1000);
      return message.reply(`⏳ İşletmelerin gelir üretmeye devam ediyor. Yeni kazancı <t:${claimAt}:R> sonra alabilirsin.`);
    }

    const breakdown = result.earnings
      .map(({ product, amount }) => `${product.emoji} **${product.name}:** +${formatMoney(amount)}`)
      .join("\n");
    const embed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle("🏬 İşletme Gelirleri Tahsil Edildi")
      .setDescription(
        `${breakdown}\n\n` +
        `Toplam kazanç: **+${formatMoney(result.amount)}**\n` +
        `Yeni bakiye: **${formatMoney(result.balance)}**`
      )
      .setFooter({ text: `Gelir saatte birikir; en fazla ${formatDuration(7 * 24 * 60 * 60 * 1000)} saklanır.` })
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }
};
