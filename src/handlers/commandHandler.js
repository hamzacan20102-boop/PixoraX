const fs = require("fs");
const path = require("path");

module.exports = client => {
  const commandsPath = path.join(__dirname, "../commands");

  for (const file of fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"))) {
    const command = require(path.join(commandsPath, file));
    client.commands.set(command.name, command);
    if (Array.isArray(command.aliases)) {
      for (const alias of command.aliases) client.commands.set(alias, command);
    }
  }
};