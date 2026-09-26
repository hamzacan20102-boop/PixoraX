const { handleMessage } = require("./messageCreate");
const { handleMemberAdd } = require("./guildMemberAdd");
const { handleInteraction } = require("./interactionCreate");
const { handleReady } = require("./ready");

module.exports = client => {
  client.once("clientReady", () => handleReady(client));
  client.on("messageCreate", message => handleMessage(client, message));
  client.on("guildMemberAdd", member => handleMemberAdd(client, member));
  client.on("interactionCreate", interaction => handleInteraction(interaction));
};