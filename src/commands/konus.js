const messages = [
  "💬 PixoraX aktif! `p.yardım` ile komutlara bakabilirsin.",
  "🚀 PixoraX topluluğuna hoş geldin!",
  "🎮 Oyun zamanı! Herkese iyi eğlenceler.",
  "✨ Yeni mesaj var! Sohbete katılmayı unutma."
];

module.exports = {
  name: "konus",
  async execute({ message }) {
    const text = messages[Math.floor(Math.random() * messages.length)];
    await message.channel.send(text);
  }
};