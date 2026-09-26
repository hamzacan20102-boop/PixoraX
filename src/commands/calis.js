const { EmbedBuilder } = require("discord.js");
const { formatDuration, formatMoney, work, WORK_COOLDOWN_MS } = require("../utils/economyStore");

module.exports = {
  name: "çalış",
  aliases: ["calis", "iş", "is", "work"],
  async execute({ message }) {
    const now = Date.now();
    const result = work(message.author.id, now);

    if (!result.worked) {
      const nextWork = Math.ceil((now + result.remainingMs) / 1000);
      return message.reply(`🛠️ Yeni bir iş için <t:${nextWork}:R> beklemelisin.`);
    }

    const nextWork = Math.ceil((now + WORK_COOLDOWN_MS) / 1000);
    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle("🧰 Mesai Bitti")
      .setDescription(
        `${message.author} ${result.job}.\n\n` +
        `Kazanç: **+${formatMoney(result.amount)}**\n` +
        `Cüzdan: **${formatMoney(result.balance)}**`
      )
      .setFooter({ text: `Yeni iş ${formatDuration(WORK_COOLDOWN_MS)} sonra açılır.` })
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }
};