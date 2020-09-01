const Player = require('../playerclass.js');

function getTimeString() {
    let today = new Date();
    let date = `${today.getMonth() + 1}-${today.getDate()}`;
    let time = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
    return `[${date} ${time}] :`;
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

module.exports.run = async (bot, message, args) => {
    console.log(`${getTimeString()} The command 'teamtest' has been used by ${message.author.username}.`);

    let roleAdm = message.guild.roles.find(r => r.name === "Administrator");
    if (!roleAdm) {
        console.log(`${getTimeString()} The Administrator role does not exist on this server.`);
    } else {
        let user = message.author;
        if (user) {
            let member = message.guild.member(user);
            if (member && member.roles.find(r => r.name === "Administrator")) {
                let tempLobby;
                if (bot.activelobbies.find((lobby) => {
                    tempLobby = lobby;
                    return lobby.channelid === message.channel.id;
                })) {
                    for (let i = 0; i < 10; i++) {
                        let newPlayerid = bot.players.length;
                        let player = new Player(null, bot, newPlayerid, message.author.id + i, message.author.tag, `BotTester${i}`, false);
                        //bot.activeplayers[newPlayerid] = player;
                        if (i > 4) {
                            player.applyMMR(27 * i);
                        } else {
                            player.applyMMR((-49 * i) + 13);
                        }

                        let theLobby = tempLobby;
                        let playerid = bot.players[newPlayerid].playerid;
                        console.log(`${getTimeString()} Adding playerid: ${playerid} to the queue`);
                        // Add the player to the queue
                        theLobby.addPlayerQueue(playerid);
                        theLobby.sendQueueEmbed();

                        console.log(`${getTimeString()} Is player in queue: ${theLobby.playerInQueue(playerid)}`);

                        await sleep(1500);
                    }
                } else {
                    message.reply("This is not a lobby channel.");
                }
            }
        }
    }
}

module.exports.help = {
    name: "teamtest"
}