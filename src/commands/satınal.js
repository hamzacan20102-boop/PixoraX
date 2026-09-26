const { EmbedBuilder } = require("discord.js");
const { buyProduct, formatMoney } = require("../utils/economyStore");

module.exports = {
  name: "satınal",
  aliases: ["satinal", "al"],
  async execute({ message, args }) {
    const productId = (args[0] || "").toLocaleLowerCase("tr-TR");
    const quantityText = args[1] || "1";

    if (!productId || !/^\d+$/.test(quantityText) || args.length > 2) {
      return message.reply("Kullanım: `p.satınal <ürün-kodu> [adet]` · Adet 1–1000 arası olabilir.");
    }

    const result = buyProduct(message.author.id, productId, Number(quantityText));
    if (!result.purchased) {
      const errors = {
        "unknown-product": "❌ Bu ürün markette yok. Ürün kodlarını `p.market` ile görebilirsin.",
        "invalid-quantity": "❌ Adet 1–1000 arasında güvenli bir tam sayı olmalı.",
        "insufficient-funds": `❌ Bakiye yetersiz. Toplam ${formatMoney(result.total)}, cüzdanında ${formatMoney(result.balance)} var.`,
        "inventory-limit": "❌ Bu üründen daha fazla tutamazsın."
      };
      return message.reply(errors[result.reason] || "❌ Satın alma tamamlanamadı.");
    }

    const embed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle("🛍️ Satın Alma Tamamlandı")
      .setDescription(
        `${result.product.emoji} **${result.product.name}** satın aldın.\n` +
        `Adet: **${result.quantity}**\n` +
        `Toplam: **${formatMoney(result.total)}**\n` +
        `Bu üründen toplam: **${result.owned}**\n` +
        `Kalan bakiye: **${formatMoney(result.balance)}**`
      )
      .setFooter({ text: "Satın aldıklarını p.envanter ile görüntüleyebilirsin." })
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }
};
