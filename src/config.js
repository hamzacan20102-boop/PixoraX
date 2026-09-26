module.exports = {
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.CLIENT_ID,
  ownerId: process.env.OWNER_ID?.trim() || "",
  prefix: process.env.PREFIX || "p.",
  autoDm: process.env.AUTO_DM_ENABLED !== "false",
  welcomeChannelId: process.env.WELCOME_CHANNEL_ID || "",
  logChannelId: process.env.LOG_CHANNEL_ID || "",
  supportCategoryId: process.env.SUPPORT_CATEGORY_ID || "",
  supportRoleId: process.env.SUPPORT_ROLE_ID || ""
};