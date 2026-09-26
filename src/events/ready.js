const { ActivityType } = require("discord.js");
const config = require("../config");
const { formatMoney, payOwnerSalary } = require("../utils/economyStore");

module.exports.handleReady = client => {
  console.log(`✅ ${client.user.tag} aktif | Prefix: p.`);

  if (!/^\d{17,20}$/.test(config.ownerId)) {
    console.warn("⚠️ Otomatik sahip maaşı için .env dosyasına geçerli bir OWNER_ID ekle.");
  } else {
    const payOwner = () => {
      try {
        const amount = payOwnerSalary(config.ownerId);
        if (amount > 0) {
          console.log(`💸 Sahip maaşı yatırıldı: ${formatMoney(amount)}.`);
        }
      } catch (error) {
        console.error("❌ Sahip maaşı yatırılırken hata oluştu:", error);
      }
    };

    payOwner();
    setInterval(payOwner, 60_000).unref();
  }

  const statuses = [
    { name: "PixoraX", type: ActivityType.Playing },
    { name: "p.yardım", type: ActivityType.Listening },
    { name: "PixoraX topluluğu", type: ActivityType.Watching }
  ];

  let i = 0;

  const update = () => {
    const s = statuses[i++ % statuses.length];

    client.user.setPresence({
      status: "dnd",
      activities: [
        {
          name: s.name,
          type: s.type
        }
      ]
    });
  };

  update();
  setInterval(update, 15000);
};