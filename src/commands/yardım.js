const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "yardım",
  aliases: ["help", "komutlar"],
  async execute({ message }) {
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setAuthor({ name: "PixoraX • Komut Rehberi", iconURL: message.client.user.displayAvatarURL() })
      .setDescription(`Komut öneki: **${require("../config").prefix}**\nKullanabildiğin komutlar aşağıda.`)
      .addFields(
        {
          name: "👥 Normal Komutlar",
          value: [
            "`yardım` · Bu rehberi açar",
            "`slot` · Slot oyunu oynar",
            "`bakiye [@üye]` · Cüzdanı gösterir",
            "`günlük` · Günlük ödülü alır",
            "`çalış` · İş yapıp para kazanır",
            "`kazanç` · İşletmelerden biriken geliri tahsil eder",
            "`gönder @üye <miktar>` · Para transfer eder",
            "`zenginler` · En yüksek bakiyeli 10 üyeyi gösterir",
            "`market [evler|arabalar|işyerleri]` · Varlık fiyatlarını gösterir",
            "`satınal <ürün-kodu> [adet]` · Marketten varlık alır",
            "`envanter [@üye]` · Sahip olunan varlıkları gösterir",
            "`kart` · Kullanıcı kartını gösterir",
            "`embed <mesaj>` · Embed mesaj gönderir",
            "`konus` · Rastgele sohbet mesajı gönderir",
            "`dmizin aç/kapat` · DM duyuru tercihini yönetir",
            "`sil-ticket` · Yetkili olduğun ticketı kapatır"
          ].join("\n")
        },
        {
          name: "🛡️ Yönetici Komutları",
          value: [
            "`kur` · Sunucuyu yeniden kurar; kanalları siler",
            "`duyuru <mesaj>` · Bulunduğun kanala duyuru yollar",
            "`temizle [sayı]` · Mesajları temizler",
            "`ban @üye` · Üyeyi yasaklar",
            "`kick @üye` · Üyeyi sunucudan atar"
          ].join("\n")
        },
        {
          name: "👑 Sahibe Özel",
          value: "`topludm <mesaj>` · Yalnızca DM almayı açmış üyelere duyuru gönderir (en fazla 50 kişi/komut)."
        }
      )
      .setFooter({ text: "Yönetici komutları Discord izinlerini gerektirir." })
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }
};