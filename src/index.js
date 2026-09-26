require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection
} = require("discord.js");

const config = require("./config");
const registerEvents = require("./events");
const loadCommands = require("./handlers/commandHandler");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

client.commands = new Collection();
loadCommands(client);
registerEvents(client);

if (!config.token || config.token === "YOUR_BOT_TOKEN") {
  throw new Error("DISCORD_TOKEN is missing. Set it in your .env file.");
}

client.login(config.token);
