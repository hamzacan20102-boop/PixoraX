const { EmbedBuilder } = require("discord.js");
const { formatMoney, getBalance } = require("../utils/economyStore");

module.exports = {
  name: "bakiye",
  aliases: ["para", "balance"],
  async execute({ message }) {
    const user = message.mentions.users.first() || message.author;
    const balance = getBalance(user.id);
    const embed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setAuthor({ name: `${user.username} • Cüzdan`, iconURL: user.displayAvatarURL() })
      .setDescription(`💰 **Bakiye**\n${formatMoney(balance)}`)
      .setFooter({ text: "PixoraX Ekonomi" })
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }
};