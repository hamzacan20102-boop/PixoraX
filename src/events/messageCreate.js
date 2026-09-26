const config = require("../config");

module.exports.handleMessage = async (client, message) => {
  if (message.author.bot || !message.guild) return;
  if (!message.content.toLowerCase().startsWith(config.prefix.toLowerCase())) return;

  const args = message.content.slice(config.prefix.length).trim().split(/\s+/);
  const name = (args.shift() || "").toLowerCase();
  const command = client.commands.get(name);

  if (!command) return;

  try {
    await command.execute({ client, message, args });
  } catch (e) {
    console.error(e);
    await message.reply("❌ Komut çalıştırılırken bir hata oluştu.");
  }
};