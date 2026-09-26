const {
  ChannelType,
  PermissionsBitField,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

module.exports = {
  name: "kur",
  description: "PixoraX sunucusunu sıfırdan kurar.",
  async execute({ message }) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator))
      return message.reply("❌ Bu komut sadece yöneticilere açık.");

    const guild = message.guild;
    await message.reply("⏳ PixoraX kurulumu başlıyor. Mevcut kanallar silinecek...");

    for (const ch of [...guild.channels.cache.values()]) {
      if (ch.deletable) await ch.delete().catch(() => {});
    }

    const roles = {};
    roles.owner = await guild.roles.create({ name: "👑・Sunucu Sahibi", permissions: [PermissionsBitField.Flags.Administrator] });
    roles.admin = await guild.roles.create({ name: "🔱・Yönetici", permissions: [PermissionsBitField.Flags.ManageGuild, PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.ManageMessages, PermissionsBitField.Flags.KickMembers, PermissionsBitField.Flags.BanMembers] });
    roles.mod = await guild.roles.create({ name: "🛡️・Moderatör", permissions: [PermissionsBitField.Flags.ManageMessages, PermissionsBitField.Flags.KickMembers, PermissionsBitField.Flags.ModerateMembers] });
    roles.support = await guild.roles.create({ name: "🎫・Destek Ekibi" });
    roles.vip = await guild.roles.create({ name: "💎・VIP" });
    roles.booster = await guild.roles.create({ name: "🚀・Booster" });
    roles.member = await guild.roles.create({ name: "👤・Üye" });

    const info = await guild.channels.create({ name: "📌・BİLGİ", type: ChannelType.GuildCategory });
    const community = await guild.channels.create({ name: "💬・TOPLULUK", type: ChannelType.GuildCategory });
    const media = await guild.channels.create({ name: "🎨・MEDYA", type: ChannelType.GuildCategory });
    const support = await guild.channels.create({ name: "🎫・DESTEK", type: ChannelType.GuildCategory });
    const adminCat = await guild.channels.create({
      name: "🔒・YÖNETİM",
      type: ChannelType.GuildCategory,
      permissionOverwrites: [
        { id: guild.roles.everyone.id, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: roles.owner.id, allow: [PermissionsBitField.Flags.ViewChannel] },
        { id: roles.admin.id, allow: [PermissionsBitField.Flags.ViewChannel] },
        { id: roles.mod.id, allow: [PermissionsBitField.Flags.ViewChannel] }
      ]
    });
    const voice = await guild.channels.create({ name: "🔊・SES", type: ChannelType.GuildCategory });

    const createText = (name, parent, opts={}) => guild.channels.create({
      name, type: ChannelType.GuildText, parent,
      permissionOverwrites: opts.permissionOverwrites || []
    });

    const welcome = await createText("👋・hoş-geldin", info);
    await createText("📢・duyurular", info, {
      permissionOverwrites: [{
        id: guild.roles.everyone.id,
        deny: [PermissionsBitField.Flags.SendMessages]
      }]
    });
    await createText("📜・kurallar", info);
    await createText("ℹ️・bilgilendirme", info);
    await createText("💬・genel", community);
    await createText("🤖・bot-komutları", community);
    await createText("🎮・oyun", community);
    await createText("💡・öneriler", community);
    await createText("🖼️・görseller", media);
    await createText("🎬・videolar", media);
    await createText("😂・memeler", media);

    const supportChannel = await createText("🎫・destek", support);
    await createText("📋・mod-log", adminCat);
    await createText("🛡️・moderasyon", adminCat);
    await createText("👑・yönetim", adminCat);

    await guild.channels.create({ name: "🔊・Genel Sohbet", type: ChannelType.GuildVoice, parent: voice });
    await guild.channels.create({ name: "🎮・Oyun Odası", type: ChannelType.GuildVoice, parent: voice });
    await guild.channels.create({ name: "🎵・Müzik", type: ChannelType.GuildVoice, parent: voice });

    const embed = new EmbedBuilder()
      .setTitle("🎫 PixoraX Destek Merkezi")
      .setDescription("Destek almak için aşağıdaki butona bas.\n\nHer kullanıcı aynı anda bir ticket açabilir.")
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("px_ticket_open").setLabel("Destek Talebi Oluştur").setEmoji("🎫").setStyle(ButtonStyle.Primary)
    );
    await supportChannel.send({ embeds: [embed], components: [row] });

    await welcome.send({ embeds: [new EmbedBuilder().setTitle("👋 PixoraX'e Hoş Geldin").setDescription("Sunucuya hoş geldin! Kuralları okumayı unutma.").setTimestamp()] });

    await message.channel.send("✅ **PixoraX kurulumu tamamlandı!**\n🎫 Ticket sistemi aktif\n👤 Otomatik Üye rolü aktif\n📁 Kanallar ve izinler hazır.");
  }
};