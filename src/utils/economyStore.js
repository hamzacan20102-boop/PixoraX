const fs = require("node:fs");
const path = require("node:path");
const { findProduct, products } = require("./marketCatalog");

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
const MAX_BUSINESS_HOURS = 24 * 7;
const OWNER_DAILY_SALARY = 420_000_000_000_000_000_000_000n;
const LEGACY_OWNER_DAILY_SALARY = 1_000_000n;
const DAILY_REWARD = 25_000;
const WORK_COOLDOWN_MS = 60 * 60 * 1000;
const WORK_MIN = 2_000;
const WORK_MAX = 8_000;
const STORE_PATH = process.env.ECONOMY_DATA_FILE
  ? path.resolve(process.env.ECONOMY_DATA_FILE)
  : path.resolve(__dirname, "../../data/economy.json");

const JOBS = [
  "bir kafede vardiya tamamladın",
  "bir tasarım işini teslim ettin",
  "bir depoda mesai yaptın",
  "mahalledeki küçük bir işi hallettin",
  "bir yazılım hatasını çözdün"
];

function emptyStore() {
  return {
    users: {},
    ownerSalaryUserId: "",
    ownerSalaryDate: "",
    ownerSalaryPaidAmount: 0n
  };
}

function loadStore() {
  let store;

  try {
    store = JSON.parse(fs.readFileSync(STORE_PATH, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return emptyStore();
    throw new Error(`Ekonomi verisi okunamadı: ${error.message}`);
  }

  if (!store || typeof store !== "object" || Array.isArray(store)) {
    throw new Error("Ekonomi verisi geçersiz biçimde.");
  }

  if (!store.users || typeof store.users !== "object" || Array.isArray(store.users)) {
    store.users = {};
  }

  return store;
}

function saveStore(store) {
  fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
  const temporaryPath = `${STORE_PATH}.${process.pid}.tmp`;
  fs.writeFileSync(temporaryPath, JSON.stringify(store, (_key, value) =>
    typeof value === "bigint" ? value.toString() : value, 2), "utf8");
  fs.renameSync(temporaryPath, STORE_PATH);
}

function parseMoney(value) {
  if (typeof value === "bigint") return value >= 0n ? value : 0n;
  if (typeof value === "number") {
    return Number.isSafeInteger(value) && value >= 0 ? BigInt(value) : 0n;
  }
  if (typeof value === "string" && /^\d+$/.test(value)) return BigInt(value);
  return 0n;
}

function readAccount(store, userId) {
  const account = store.users[userId];
  if (!account || typeof account !== "object" || Array.isArray(account)) {
    return { balance: 0n, dailyClaimedAt: 0, workAvailableAt: 0, inventory: {}, businessLots: [] };
  }

  const inventory = account.inventory && typeof account.inventory === "object" && !Array.isArray(account.inventory)
    ? Object.fromEntries(Object.entries(account.inventory).filter(([, quantity]) => Number.isSafeInteger(quantity) && quantity > 0))
    : {};
  const businessLots = Array.isArray(account.businessLots)
    ? account.businessLots.filter(lot =>
      lot && typeof lot.productId === "string" &&
      findProduct(lot.productId)?.categoryId === "isyerleri" &&
      Number.isSafeInteger(lot.quantity) && lot.quantity > 0 &&
      Number.isFinite(lot.lastCollectedAt) && lot.lastCollectedAt >= 0
    ).map(lot => ({
      productId: lot.productId,
      quantity: lot.quantity,
      lastCollectedAt: lot.lastCollectedAt
    }))
    : [];

  return {
    balance: parseMoney(account.balance),
    dailyClaimedAt: Number.isFinite(account.dailyClaimedAt) ? account.dailyClaimedAt : 0,
    workAvailableAt: Number.isFinite(account.workAvailableAt) ? account.workAvailableAt : 0,
    inventory,
    businessLots
  };
}

function getOrCreateAccount(store, userId) {
  const account = readAccount(store, userId);
  store.users[userId] = account;
  return account;
}

function isDiscordId(userId) {
  return /^\d{17,20}$/.test(String(userId));
}

function payOwnerSalary(ownerId, now = new Date()) {
  if (!isDiscordId(ownerId)) return 0;

  const store = loadStore();
  const today = now.toISOString().slice(0, 10);
  const sameOwner = store.ownerSalaryUserId === ownerId;

  if (sameOwner && store.ownerSalaryDate === today) {
    const paidAmount = store.ownerSalaryPaidAmount === undefined
      ? LEGACY_OWNER_DAILY_SALARY
      : parseMoney(store.ownerSalaryPaidAmount);
    const topUp = OWNER_DAILY_SALARY > paidAmount ? OWNER_DAILY_SALARY - paidAmount : 0n;
    if (topUp === 0n) return 0n;

    const account = getOrCreateAccount(store, ownerId);
    account.balance += topUp;
    store.ownerSalaryPaidAmount = OWNER_DAILY_SALARY;
    saveStore(store);
    return topUp;
  }

  let daysDue = 1;

  if (sameOwner && store.ownerSalaryDate) {
    const lastPaidAt = Date.parse(`${store.ownerSalaryDate}T00:00:00.000Z`);
    const todayAt = Date.parse(`${today}T00:00:00.000Z`);
    if (Number.isFinite(lastPaidAt)) {
      daysDue = Math.max(0, Math.floor((todayAt - lastPaidAt) / DAY_MS));
    }
  }

  if (daysDue === 0) return 0;

  const amount = BigInt(daysDue) * OWNER_DAILY_SALARY;
  const account = getOrCreateAccount(store, ownerId);
  account.balance += amount;
  store.ownerSalaryUserId = ownerId;
  store.ownerSalaryDate = today;
  store.ownerSalaryPaidAmount = OWNER_DAILY_SALARY;
  saveStore(store);
  return amount;
}

function getBalance(userId) {
  return readAccount(loadStore(), userId).balance;
}

function getRichestUsers(limit = 10) {
  const safeLimit = Number.isInteger(limit) ? Math.min(Math.max(limit, 1), 100) : 10;
  const store = loadStore();

  return Object.keys(store.users)
    .map(userId => ({ userId, balance: readAccount(store, userId).balance }))
    .filter(account => account.balance > 0n)
    .sort((left, right) => {
      if (left.balance === right.balance) return left.userId.localeCompare(right.userId);
      return left.balance > right.balance ? -1 : 1;
    })
    .slice(0, safeLimit);
}

function synchronizeBusinessLots(account, now) {
  let changed = false;

  for (const product of products.filter(item => item.categoryId === "isyerleri")) {
    const owned = account.inventory[product.id] || 0;
    const lots = account.businessLots.filter(lot => lot.productId === product.id);
    const recorded = lots.reduce((total, lot) => total + lot.quantity, 0);

    if (recorded > owned) {
      let excess = recorded - owned;
      for (const lot of lots.reverse()) {
        const reduction = Math.min(excess, lot.quantity);
        lot.quantity -= reduction;
        excess -= reduction;
        if (excess === 0) break;
      }
      changed = true;
    } else if (recorded < owned) {
      account.businessLots.push({
        productId: product.id,
        quantity: owned - recorded,
        lastCollectedAt: now
      });
      changed = true;
    }
  }

  const previousLength = account.businessLots.length;
  account.businessLots = account.businessLots.filter(lot => lot.quantity > 0);
  return changed || account.businessLots.length !== previousLength;
}

function buyProduct(userId, productId, quantity) {
  const product = findProduct(productId);
  if (!product) return { purchased: false, reason: "unknown-product" };
  if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 1000) {
    return { purchased: false, reason: "invalid-quantity" };
  }

  const total = BigInt(product.price) * BigInt(quantity);

  const store = loadStore();
  const account = getOrCreateAccount(store, userId);
  const purchasedAt = Date.now();
  synchronizeBusinessLots(account, purchasedAt);
  const owned = account.inventory[product.id] || 0;

  if (account.balance < total) {
    return { purchased: false, reason: "insufficient-funds", balance: account.balance, total, product };
  }
  if (!Number.isSafeInteger(owned + quantity)) {
    return { purchased: false, reason: "inventory-limit", product };
  }

  account.balance -= total;
  account.inventory[product.id] = owned + quantity;
  if (product.categoryId === "isyerleri") {
    account.businessLots.push({
      productId: product.id,
      quantity,
      lastCollectedAt: purchasedAt
    });
  }
  saveStore(store);
  return { purchased: true, product, quantity, total, balance: account.balance, owned: owned + quantity };
}

function getInventory(userId) {
  const account = readAccount(loadStore(), userId);
  return Object.entries(account.inventory)
    .map(([productId, quantity]) => {
      const product = findProduct(productId);
      return product ? { product, quantity } : null;
    })
    .filter(Boolean)
    .sort((left, right) => left.product.categoryId.localeCompare(right.product.categoryId));
}

function collectBusinessIncome(userId, now = Date.now()) {
  const store = loadStore();
  const account = getOrCreateAccount(store, userId);
  let changed = synchronizeBusinessLots(account, now);
  if (account.businessLots.length === 0) {
    if (changed) saveStore(store);
    return { collected: false, reason: "no-business" };
  }

  let amount = 0n;
  let remainingMs = HOUR_MS;
  const earnings = new Map();

  for (const lot of account.businessLots) {
    const product = findProduct(lot.productId);
    if (!product || !product.incomePerHour) continue;

    const elapsed = Math.max(0, now - lot.lastCollectedAt);
    const accruedHours = Math.floor(elapsed / HOUR_MS);
    const payableHours = Math.min(accruedHours, MAX_BUSINESS_HOURS);

    if (payableHours > 0) {
      const earned = BigInt(product.incomePerHour) * BigInt(lot.quantity) * BigInt(payableHours);
      amount += earned;
      const existing = earnings.get(product.id) || { product, amount: 0n };
      existing.amount += earned;
      earnings.set(product.id, existing);
      lot.lastCollectedAt = accruedHours > MAX_BUSINESS_HOURS
        ? now
        : lot.lastCollectedAt + payableHours * HOUR_MS;
      changed = true;
    } else {
      remainingMs = Math.min(remainingMs, HOUR_MS - elapsed);
    }
  }

  if (amount === 0n) {
    if (changed) saveStore(store);
    return { collected: false, reason: "not-ready", remainingMs };
  }

  account.balance += amount;
  saveStore(store);
  return {
    collected: true,
    amount,
    balance: account.balance,
    earnings: [...earnings.values()]
  };
}

function claimDaily(userId, now = Date.now()) {
  const store = loadStore();
  const account = getOrCreateAccount(store, userId);
  const remainingMs = DAY_MS - (now - account.dailyClaimedAt);

  if (remainingMs > 0) return { claimed: false, remainingMs };

  account.balance += BigInt(DAILY_REWARD);
  account.dailyClaimedAt = now;
  saveStore(store);
  return { claimed: true, amount: DAILY_REWARD, balance: account.balance };
}

function work(userId, now = Date.now()) {
  const store = loadStore();
  const account = getOrCreateAccount(store, userId);
  const remainingMs = account.workAvailableAt - now;

  if (remainingMs > 0) return { worked: false, remainingMs };

  const amount = BigInt(WORK_MIN + Math.floor(Math.random() * (WORK_MAX - WORK_MIN + 1)));
  const job = JOBS[Math.floor(Math.random() * JOBS.length)];
  account.balance += amount;
  account.workAvailableAt = now + WORK_COOLDOWN_MS;
  saveStore(store);

  return { worked: true, amount, job, balance: account.balance };
}

function transfer(fromId, toId, amount) {
  const transferAmount = parseMoney(amount);
  if (!isDiscordId(fromId) || !isDiscordId(toId) || fromId === toId) {
    return { sent: false, reason: "invalid-recipient" };
  }
  if (transferAmount <= 0n) {
    return { sent: false, reason: "invalid-amount" };
  }

  const store = loadStore();
  const sender = getOrCreateAccount(store, fromId);
  const recipient = getOrCreateAccount(store, toId);
  if (sender.balance < transferAmount) {
    return { sent: false, reason: "insufficient-funds", balance: sender.balance };
  }

  sender.balance -= transferAmount;
  recipient.balance += transferAmount;
  saveStore(store);
  return { sent: true, amount: transferAmount, balance: sender.balance };
}

function formatMoney(amount) {
  const value = typeof amount === "bigint" ? amount : Number.isFinite(amount) ? amount : 0;
  return `${new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(value)} ₺`;
}

function formatDuration(milliseconds) {
  const totalMinutes = Math.max(1, Math.ceil(milliseconds / 60_000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours ? `${hours} sa ${minutes} dk` : `${minutes} dk`;
}

module.exports = {
  DAILY_REWARD,
  OWNER_DAILY_SALARY,
  WORK_COOLDOWN_MS,
  buyProduct,
  claimDaily,
  collectBusinessIncome,
  formatDuration,
  formatMoney,
  getBalance,
  getInventory,
  getRichestUsers,
  payOwnerSalary,
  transfer,
  work
};