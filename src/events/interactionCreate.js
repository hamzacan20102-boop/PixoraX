const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    EmbedBuilder,
    PermissionsBitField,
    MessageFlags
} = require("discord.js");

module.exports.handleInteraction = async (interaction) => {
    try {

        // Sadece butonları işle
        if (!interaction.isButton || !interaction.isButton()) {
            return;
        }

        // =====================================
        // 🎫 TICKET AÇ
        // =====================================

        if (interaction.customId === "px_ticket_open") {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            const guild = interaction.guild;

            if (!guild) {
                return interaction.editReply("❌ Bu işlem yalnızca sunucuda kullanılabilir.");
            }

            const category = guild.channels.cache.find(
                channel =>
                    channel.name === "🎫・DESTEK" &&
                    channel.type === ChannelType.GuildCategory
            );

            if (!category) {
                return interaction.editReply(
                    "❌ `🎫・DESTEK` kategorisi bulunamadı. `p.kur` komutunu tekrar çalıştır."
                );
            }

            // Kullanıcının zaten açık ticketı var mı?
            const existingTicket = guild.channels.cache.find(
                channel =>
                    channel.parentId === category.id &&
                    channel.topic === `ticket:${interaction.user.id}`
            );

            if (existingTicket) {
                return interaction.editReply(`❌ Zaten açık bir ticketın var: ${existingTicket}`);
            }

            const supportRole = guild.roles.cache.find(
                role => role.name === "🎫・Destek Ekibi"
            );

            const adminRole = guild.roles.cache.find(
                role => role.name === "🔱・Yönetici"
            );

            const ownerRole = guild.roles.cache.find(
                role => role.name === "👑・Sunucu Sahibi"
            );

            const permissions = [
                {
                    id: guild.roles.everyone.id,
                    deny: [
                        PermissionsBitField.Flags.ViewChannel
                    ]
                },

                {
                    id: interaction.user.id,
                    allow: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.ReadMessageHistory,
                        PermissionsBitField.Flags.AttachFiles,
                        PermissionsBitField.Flags.EmbedLinks
                    ]
                }
            ];

            if (supportRole) {
                permissions.push({
                    id: supportRole.id,
                    allow: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.ReadMessageHistory,
                        PermissionsBitField.Flags.ManageMessages,
                        PermissionsBitField.Flags.AttachFiles
                    ]
                });
            }

            if (adminRole) {
                permissions.push({
                    id: adminRole.id,
                    allow: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.ReadMessageHistory,
                        PermissionsBitField.Flags.ManageMessages
                    ]
                });
            }

            if (ownerRole) {
                permissions.push({
                    id: ownerRole.id,
                    allow: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.ReadMessageHistory,
                        PermissionsBitField.Flags.ManageMessages
                    ]
                });
            }

            const safeUsername = interaction.user.username
                .toLowerCase()
                .replace(/[^a-z0-9]/g, "")
                .slice(0, 18) || "uye";

            const ticket = await guild.channels.create({
                name: `ticket-${safeUsername}`,
                type: ChannelType.GuildText,
                parent: category.id,
                topic: `ticket:${interaction.user.id}`,
                permissionOverwrites: permissions
            });

            const embed = new EmbedBuilder()
                .setTitle("🎫 PixoraX Destek Talebi")
                .setDescription(
                    `Merhaba ${interaction.user} 👋\n\n` +
                    `Destek talebin başarıyla oluşturuldu.\n\n` +
                    `📝 **Sorununu ayrıntılı şekilde açıklayabilirsin.**\n` +
                    `🛡️ Destek ekibi seninle ilgilenecek.\n\n` +
                    `Ticketı kapatmak için aşağıdaki **🔒 Ticket Kapat** butonunu kullanabilirsin.`
                )
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter({
                    text: "PixoraX Destek Sistemi"
                })
                .setTimestamp();

            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("px_ticket_close")
                    .setLabel("Ticket Kapat")
                    .setEmoji("🔒")
                    .setStyle(ButtonStyle.Danger)
            );

            const mention = supportRole
                ? `${interaction.user} <@&${supportRole.id}>`
                : `${interaction.user}`;

            await ticket.send({
                content: mention,
                embeds: [embed],
                components: [buttons]
            });

            return interaction.editReply(`✅ Destek talebin oluşturuldu: ${ticket}`);
        }

        // =====================================
        // 🔒 TICKET KAPAT
        // =====================================

        if (interaction.customId === "px_ticket_close") {

            const channel = interaction.channel;

            if (!channel || !channel.name.startsWith("ticket-")) {
                return interaction.reply({
                    content: "❌ Bu kanal bir ticket değil.",
                    flags: MessageFlags.Ephemeral
                });
            }

            const ownerId = channel.topic?.replace("ticket:", "");

            const isOwner = ownerId === interaction.user.id;

            const isSupport = interaction.member.roles.cache.some(
                role => role.name === "🎫・Destek Ekibi"
            );

            const isAdmin = interaction.member.roles.cache.some(
                role => role.name === "🔱・Yönetici"
            );

            const isOwnerRole = interaction.member.roles.cache.some(
                role => role.name === "👑・Sunucu Sahibi"
            );

            if (!isOwner && !isSupport && !isAdmin && !isOwnerRole) {
                return interaction.reply({
                    content: "❌ Bu ticketı kapatma yetkin yok.",
                    flags: MessageFlags.Ephemeral
                });
            }

            await interaction.reply({
                content: "🔒 Ticket **3 saniye içinde** kapatılıyor..."
            });

            setTimeout(() => {
                channel.delete("PixoraX ticket kapatıldı")
                    .catch(() => {});
            }, 3000);
        }

    } catch (error) {

        console.error("❌ Interaction hatası:", error);

        if (interaction.deferred) {
            try {
                await interaction.editReply("❌ İşlem sırasında bir hata oluştu.");
            } catch {}
            return;
        }

        if (interaction.replied) {
            return;
        }

        try {
            await interaction.reply({
                content: "❌ İşlem sırasında bir hata oluştu.",
                flags: MessageFlags.Ephemeral
            });
        } catch {}
    }
};