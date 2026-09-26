const { EmbedBuilder } = require("discord.js");
const { formatMoney, getBalance, getInventory } = require("../utils/economyStore");

module.exports = {
  name: "envanter",
  aliases: ["varlıklar", "varliklar"],
  async execute({ message }) {
    const user = message.mentions.users.first() || message.author;
    const inventory = getInventory(user.id);
    const description = inventory.length
      ? inventory.map(({ product, quantity }) => {
        const income = product.incomePerHour
          ? ` · +${formatMoney(product.incomePerHour)}/saat gelir`
          : "";
        return `${product.emoji} **${product.name}** · **${quantity} adet** · ${product.categoryLabel}${income}`;
      }).join("\n")
      : "Henüz satın aldığın bir varlık yok. Ürünlere `p.market` ile göz atabilirsin.";

    const embed = new EmbedBuilder()
      .setColor(0x9b59b6)
      .setAuthor({ name: `${user.username} • Envanter`, iconURL: user.displayAvatarURL() })
      .setDescription(description)
      .addFields({ name: "💰 Cüzdan", value: formatMoney(getBalance(user.id)), inline: true })
      .setFooter({ text: "Bir kullanıcıyı görüntülemek için p.envanter @üye" })
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }
};
