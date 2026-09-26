const { EmbedBuilder } = require("discord.js");
const { formatMoney, getRichestUsers } = require("../utils/economyStore");

const MEDALS = ["🥇", "🥈", "🥉"];

module.exports = {
  name: "zenginler",
  aliases: ["liderlik", "top10", "richest"],
  async execute({ message }) {
    const richest = getRichestUsers(10);
    const rows = richest.map((account, index) => {
      const rank = MEDALS[index] || `**${index + 1}.**`;
      return `${rank} <@${account.userId}>\n└ **${formatMoney(account.balance)}**`;
    });

    const embed = new EmbedBuilder()
      .setColor(0xf1c40f)
      .setAuthor({ name: "PixoraX • En Zenginler", iconURL: message.client.user.displayAvatarURL() })
      .setDescription(rows.length ? rows.join("\n\n") : "Henüz sıralamaya girecek bakiye yok. İlk paranı `p.çalış` ile kazan!")
      .setFooter({ text: "Sıralama kayıtlı cüzdan bakiyelerine göre hesaplanır." })
      .setTimestamp();

    return message.reply({
      embeds: [embed],
      allowedMentions: { parse: [] }
    });
  }
};