// import { Player } from "";
// import { Lobby } from "";
// const Discord = require("discord.js");

function getTimeString() {
    let today = new Date();
    let date = `${today.getMonth()+1}-${today.getDate()}`;
    let time = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
    return `[${date} ${time}] :`;
}

module.exports.run = async (bot, message, args) => {
    console.log(`${getTimeString()} The command 'playerinfo' has been used by ${message.author.username}.`);

    if (args.length < 1) {
        let tempPlayer;
        if (!bot.activeplayers.find((player) => {
            tempPlayer = player;
            return player.discordid === message.author.id;
        })) {
            message.replay(`You are not a registered player.`);
        } else {
            let thePlayer = tempPlayer;
            message.channel.send(thePlayer.getPlayerInfoEmbed());
        }
    } else {
        let theUser = message.mentions.users.first();
        if (theUser != null) {
            let tempPlayer;
            if (!bot.activeplayers.find((player) => {
                tempPlayer = player;
                return player.discordid === theUser.id;
            })) {
                message.replay("This user is not a registered player.");
            } else {
                let thePlayer = tempPlayer;
                message.channel.send(thePlayer.getPlayerInfoEmbed());
            }
        }
    }

}

module.exports.help = {
    name: "playerinfo"
}