//slash/botstatus.js
const { t } = require('../../utils/i18n.js');
const { dependencies } = require('../../package.json');
const config = require("../../config.json")

module.exports = {
metadata: {
    name: "botstatus",
    description: t('commands.botstatus.metadata_description')
},

async run(client, int, tools) {

    let versionNumber = client.version.version != Math.round(client.version.version) ? client.version.version : client.version.version.toFixed(1)

    let stats = await client.shard.broadcastEval(cl => ({ guilds: cl.guilds.cache.size, users: cl.users.cache.size }))
    let totalServers = stats.reduce((a, b) => a + b.guilds, 0)

    let botStatus = [
        t('commands.botstatus.creator'),
        t('commands.botstatus.version', { version: versionNumber, time: Math.round(client.version.updated / 1000) }),
        t('commands.botstatus.shard', { id: client.shard.id, count: client.shard.count - 1 }),
        t('commands.botstatus.uptime', { time: tools.timestamp(client.uptime) }),
        t('commands.botstatus.servers', { total: tools.commafy(totalServers), shardText: client.shard.count == 1 ? "" : t('commands.botstatus.on_shard', { count: tools.commafy(client.guilds.cache.size) }) }),
        t('commands.botstatus.memory', { ram: Number((process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)) })
    ]

    let embed = tools.createEmbed({
        author: { name: client.user.displayName, iconURL: client.user.avatarURL() },
        color: tools.COLOR, timestamp: true, footer: t('commands.botstatus.pinging'),
        description: botStatus.join("\n")
    })

    let infoButtons = [{style: "Link", label: t('commands.botstatus.btn_website'), url: `${tools.WEBSITE}`}]
    if (config.changelogURL) infoButtons.push({style: "Link", label: t('commands.botstatus.btn_changelog'), url: config.changelogURL})
    if (config.supportURL) infoButtons.push({style: "Link", label: t('commands.botstatus.btn_support'), url: config.supportURL})

    int.reply({embeds: [embed], components: tools.row(tools.button(infoButtons)), fetchReply: true}).then(msg => {
        embed.setFooter({ text: t('commands.botstatus.ping_result', { ms: tools.commafy(msg.createdTimestamp - int.createdAt) }) })
        int.editReply({ embeds: [embed], components: msg.components })
    })

}}