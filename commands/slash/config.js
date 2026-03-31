//slash/config.js
const { t } = require('../../utils/i18n.js');
module.exports = {
metadata: {
    permission: "ManageGuild",
    name: "config",
    description: t('commands.config.metadata_description'),
},

async run(client, int, tools) {

    let db = await tools.fetchSettings()
    let settings = db.settings
    if (!tools.canManageServer(int.member, db.settings.manualPerms)) return tools.warn("*notMod")

    let polarisSettings = [
        t('commands.config.xpEnabled', { status: settings.enabled ? t('commands.config.yes') : t('commands.config.no') }),
        t('commands.config.xpPerMsg', { range: settings.gain.min == settings.gain.max ? tools.commafy(settings.gain.min) : `${tools.commafy(settings.gain.min)} - ${tools.commafy(settings.gain.max)}` }),
        t('commands.config.xpCooldown', { time: tools.commafy(settings.gain.time), sec: tools.extraS("sec", settings.gain.time) }),
        t('commands.config.xpCurve', { curve: `${settings.curve[3]}x³ + ${settings.curve[2]}x² + ${settings.curve[1]}x` }),
        t('commands.config.lvlMsg', { status: settings.levelUp.enabled && settings.levelUp.message ? (settings.levelUp.embed ? t('commands.config.enabledEmbed') : t('commands.config.enabled')) : t('commands.config.disabled') }),
        t('commands.config.rankCards', { status: settings.rankCard.disabled ? t('commands.config.disabled') : settings.rankCard.ephemeral ? t('commands.config.enabledHidden') : t('commands.config.enabled') }),
        t('commands.config.leaderboard', { status: settings.leaderboard.disabled ? t('commands.config.disabled') : `[${settings.leaderboard.private ? t('commands.config.private') : t('commands.config.public')}](<${tools.WEBSITE}/leaderboard/${int.guild.id}>)` })
    ]

    let embed = tools.createEmbed({
        author: { name: t('commands.config.embedAuthor', { guild: int.guild.name }), iconURL: int.guild.iconURL() },
        footer: t('commands.config.embedFooter'),
        color: tools.COLOR, timestamp: true,
        description: polarisSettings.join("\n")
    })

    let toggleButton = settings.enabled ?
      {style: "Danger", label: t('commands.config.btnDisableXP'), emoji: "❕", customId: "toggle_xp" }
    : {style: "Success", label: t('commands.config.btnEnableXP'), emoji: "✨", customId: "toggle_xp" }

    let buttons = tools.button([
        {style: "Success", label: t('commands.config.btnEditSettings'), emoji: "🛠", customID: "settings_list"},
        toggleButton,
        {style: "Link", label: t('commands.config.btnEditOnline'), emoji: "🌎", url: `${tools.WEBSITE}/settings/${int.guild.id}`},
        {style: "Secondary", label: t('commands.config.btnExport'), emoji: "⏏️", customId: "export_xp"}
    ])

    let listButtons = tools.button([
        {style: "Primary", label: t('commands.config.btnRewardRoles', { count: settings.rewards.length }), customId: "list_reward_roles"},
        {style: "Primary", label: t('commands.config.btnRoleMulti', { count: settings.multipliers.roles.length }), customId: "list_multipliers~roles"},
        {style: "Primary", label: t('commands.config.btnChannelMulti', { count: settings.multipliers.channels.length }), customId: "list_multipliers~channels"}
    ])

    return int.reply({embeds: [embed], components: [tools.row(buttons)[0], tools.row(listButtons)[0]]})

}}