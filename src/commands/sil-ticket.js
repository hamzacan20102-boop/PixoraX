module.exports = {
  name: "sil-ticket",
  aliases: ["closeticket"],
  async execute({ message }) {
    if (!message.channel.name.startsWith("ticket-"))
      return message.reply("❌ Bu kanal bir ticket değil.");

    await message.reply("🔒 Ticket 2 saniye içinde kapatılıyor...");
    setTimeout(() => message.channel.delete().catch(() => {}), 2000);
  }
};