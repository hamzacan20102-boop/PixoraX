const fs = require("node:fs");
const path = require("node:path");

const STORE_PATH = process.env.DM_CONSENT_DATA_FILE
  ? path.resolve(process.env.DM_CONSENT_DATA_FILE)
  : path.resolve(__dirname, "../../data/dm-consent.json");

function readStore() {
  try {
    const store = JSON.parse(fs.readFileSync(STORE_PATH, "utf8"));
    return store && typeof store === "object" && !Array.isArray(store) ? store : {};
  } catch (error) {
    if (error.code === "ENOENT") return {};
    throw new Error(`DM izinleri okunamadı: ${error.message}`);
  }
}

function writeStore(store) {
  fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
  const temporaryPath = `${STORE_PATH}.${process.pid}.tmp`;
  fs.writeFileSync(temporaryPath, JSON.stringify(store, null, 2), "utf8");
  fs.renameSync(temporaryPath, STORE_PATH);
}

function getGuildConsent(store, guildId) {
  const consent = store[guildId];
  return consent && typeof consent === "object" && !Array.isArray(consent) ? consent : {};
}

function setConsent(guildId, userId, enabled) {
  const store = readStore();
  const consent = getGuildConsent(store, guildId);
  if (enabled) consent[userId] = true;
  else delete consent[userId];
  store[guildId] = consent;
  writeStore(store);
}

function hasConsent(guildId, userId) {
  return getGuildConsent(readStore(), guildId)[userId] === true;
}

function listConsentingUsers(guildId) {
  return Object.keys(getGuildConsent(readStore(), guildId))
    .filter(userId => /^\d{17,20}$/.test(userId));
}

module.exports = { hasConsent, listConsentingUsers, setConsent };
