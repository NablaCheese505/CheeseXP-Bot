addUhOh()

let serverSlot = $('.serverOption').first().clone()
$('.serverOption').remove()

Fetch(`./api/guilds`).then(data => {
    $('#username').text(data.user.displayName).css("color", data.user.color)

    let sortedGuilds = data.guilds.sort((a, b) => {
        return (!!b.inServer - !!a.inServer)
        || (!!b.permissions.owner - !!a.permissions.owner)
        || (!!b.permissions.server - !!a.permissions.server)
        || (!!b.xp - !!a.xp)
        || (!!b.leaderboard - !!a.leaderboard)
        || (!!b.hasData - !!a.hasData)
        || a.name.localeCompare(b.name)
    })

    let breaks = {}
    sortedGuilds.forEach((x, y) => {
        let slot = serverSlot.clone()
        slot.find('[sv=icon]').attr("src", x.icon ? `https://cdn.discordapp.com/icons/${x.id}/${x.icon}.png` : "./assets/avatar.png")
        slot.find('[sv=name]').text(x.name).attr("title", x.name).css("color", x.xp ? "#00ff80" : "white")
        slot.find('[sv=status]').text(x.permissions.owner ? "Server owner" : x.permissions.server ? "Moderator" : "Member")

        if (x.inServer) {
            if (x.permissions.server) slot.find('[sv=settings]').css("display", "block").attr("href", `./settings/${x.id}`)
            if (x.leaderboard) slot.find('[sv=leaderboard]').css("display", "block").attr("href", `./leaderboard/${x.id}`)
        }

        else if (x.permissions.server && (x.hasData || data.botPublic)) {
            if (x.hasData) slot.find('[sv=downloaddata]').css("display", "block").on("click", function(e) { e.preventDefault(); e.stopImmediatePropagation(); downloadServerData(x) })
            if (data.botPublic) slot.find('[sv=invite]').css("display", "block").attr("onclick", `window.open('./invite/${x.id}', 'popup', 'width=500,height=750'); return false`)
        }

        else return;

        let addBreak = false
        if (!breaks.isMod && x.inServer && !x.permissions.server) {
            breaks.isMod = true
            addBreak = true
        }
        else if (!breaks.xpEnabled && !x.xp && x.inServer) {
            breaks.xpEnabled = true
            addBreak = true
        }
        else if (!breaks.inServer && !x.inServer) {
            breaks.inServer = true
            addBreak = true
        }
        if (addBreak) $('#serverList').append('<div class="serverBreak"></div>')

        $('#serverList').append(slot)
    })

    $('.serverOption').click(function(e) {
        if (e.target.nodeName != "A") {
            let foundHref =  $(this).find("a:visible").last()
            if (foundHref.attr("href")) window.location.href = foundHref.attr("href")
            else foundHref.click()
        }
    })

    $('#loading').hide()
    $('#everything').show()
})
.catch((e) => {
    console.error(e)
    if (e.apiError) switch (e.code) {

        case "login":
            return loginButton()
            break;

        default:
            $('#errorfooter').text(e.message)
            break;
    }

    else {
        $('#errorfooter').text(e.message)
        $('#errorhelp').show()
    }
    
    $('#loading').hide()
    $('#uhoh').show()
})

let downloading = false
function downloadServerData(server) {
    if (!server || !confirm(`Would you like to download all Polaris data from ${server.name}? (it can be imported into other bots)`)) return

    fetch(`./api/xp/${server.id}?format=everything`).then(res => {
        if (!res.ok) {
            downloading = false
            return res.json().then(x => {
                alert(`Error! ${x.message}`);
            }).catch(e => alert("Error downloading data!"))
        }
        
        else res.blob().then(blob => {
            let downloader = document.createElement('a');
            downloader.href = URL.createObjectURL(blob)
            downloader.dataset.downloadurl = ['text/txt', downloader.download, downloader.href].join(':');
            downloader.style.display = "none"; downloader.download = `${server.name}.json`
            downloader.target = "_blank"; document.body.appendChild(downloader);
            downloader.click(); document.body.removeChild(downloader);
            downloading = false;
        })
    }).catch((e) => {
        downloading = false
        alert(`Error! ${e.responseText}`);
        console.error(e)
    })
}