const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "embed",
  async execute({ message, args }) {
    const text = args.join(" ");
    if (!text) return message.reply("Kullanım: `p.embed mesaj`");

    const embed = new EmbedBuilder()
      .setDescription(text)
      .setColor(0x5865F2)
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });
  }
};