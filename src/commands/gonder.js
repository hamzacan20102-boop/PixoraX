const { EmbedBuilder } = require("discord.js");
const { formatMoney, transfer } = require("../utils/economyStore");

module.exports = {
  name: "gönder",
  aliases: ["gonder", "pay"],
  async execute({ message, args }) {
    const recipient = message.mentions.users.first();
    const amountText = args[args.length - 1] || "";

    if (!recipient || recipient.bot || !/^\d+$/.test(amountText)) {
      return message.reply("Kullanım: `p.gönder @üye miktar`");
    }

    const result = transfer(message.author.id, recipient.id, amountText);
    if (!result.sent) {
      const messages = {
        "invalid-recipient": "❌ Kendine para gönderemezsin.",
        "invalid-amount": "❌ Miktar pozitif ve güvenli bir tam sayı olmalı.",
        "insufficient-funds": `❌ Yetersiz bakiye. Cüzdanında ${formatMoney(result.balance)} var.`
      };
      return message.reply(messages[result.reason] || "❌ Transfer gerçekleştirilemedi.");
    }

    const embed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle("💸 Transfer Tamamlandı")
      .setDescription(
        `**${message.author.username}**, **${formatMoney(result.amount)}** tutarı ` +
        `**${recipient.username}** kullanıcısına gönderdi.\n` +
        `Kalan bakiyen: **${formatMoney(result.balance)}**`
      )
      .setFooter({ text: "PixoraX Ekonomi" })
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }
};