const { EmbedBuilder } = require("discord.js");
const { formatMoney, getBalance } = require("../utils/economyStore");
const { categories, findCategory } = require("../utils/marketCatalog");

module.exports = {
  name: "market",
  aliases: ["mağaza", "magaza"],
  async execute({ message, args }) {
    const selected = args[0] ? findCategory(args[0]) : null;
    if (args.length && !selected) {
      return message.reply("Kategori: `evler`, `arabalar` veya `işyerleri`. Örnek: `p.market işyerleri`");
    }

    const sections = selected ? [selected] : categories;
    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setAuthor({ name: "PixoraX • Varlık Marketi", iconURL: message.client.user.displayAvatarURL() })
      .setDescription(
        `Cüzdanın: **${formatMoney(getBalance(message.author.id))}**\n` +
        "Almak için `p.satınal <ürün-kodu> [adet]` yaz. Ürün kodları aşağıda."
      )
      .addFields(sections.map(category => ({
        name: category.label,
        value: category.products.map(product => {
          const income = product.incomePerHour
            ? `\n💸 +${formatMoney(product.incomePerHour)}/saat pasif gelir`
            : "";

          return (
          `${product.emoji} **${product.name}** · \`${product.id}\`\n` +
          `${formatMoney(product.price)} — ${product.description}${income}`
          );
        }).join("\n\n")
      })))
      .setFooter({ text: "İşyeri alımlarında adet belirtebilirsin. Örnek: p.satınal kafe 3" })
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }
};
