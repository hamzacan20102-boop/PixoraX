const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "slot",
  async execute({ message }) {
    const symbols = ["🍒", "🍋", "🍉", "⭐", "💎", "7️⃣"];
    const pick = () => symbols[Math.floor(Math.random() * symbols.length)];
    const result = [pick(), pick(), pick()];
    const jackpot = result[0] === result[1] && result[1] === result[2];
    const pair = !jackpot && new Set(result).size === 2;

    const outcome = jackpot
      ? "🎉 **JACKPOT! Üç sembol de eşleşti.**"
      : pair
        ? "✨ **İkili eşleşme!** Güzel gidiyorsun, tekrar dene."
        : "🙃 **Bu turda eşleşme yok.** Şansını tekrar deneyebilirsin.";

    const embed = new EmbedBuilder()
      .setColor(jackpot ? 0xf1c40f : pair ? 0x57f287 : 0x5865f2)
      .setAuthor({
        name: `${message.author.username} • PixoraX Slot`,
        iconURL: message.author.displayAvatarURL()
      })
      .setDescription([
        "Makaralar durdu...",
        "",
        `🎰  **${result.join("  │  ")}**  🎰`,
        "",
        outcome
      ].join("\n"))
      .setFooter({ text: "PixoraX Oyunları • p.slot" })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
};