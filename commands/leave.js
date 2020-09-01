// import { Player } from "";
// import { Lobby } from "";
// const Discord = require("discord.js");

function getTimeString() {
    let today = new Date();
    let date = `${today.getMonth() + 1}-${today.getDate()}`;
    let time = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
    return `[${date} ${time}] :`;
}

module.exports.run = async (bot, message, args) => {
    console.log(`${getTimeString()} The command 'leave' has been used by ${message.author.username}.`);

    let tempLobby;
    if (bot.activelobbies.find((lobby) => {
        tempLobby = lobby;
        return lobby.channelid === message.channel.id;
    })) {
        let tempPlayer;
        if (bot.activeplayers.find((player) => {
            tempPlayer = player;
            return player.discordid === message.author.id;
        })) {
            let theLobby = tempLobby;
            let playerid = tempPlayer.playerid;
            // Remove the player from the queue
            theLobby.removePlayerQueue(playerid);

            // Clearing at most 4 Discord messages from the channel
            console.log(`${getTimeString()} Attempting to Delete messages.`);
            message.channel.bulkDelete(4).catch(console.error);
            console.log(`${getTimeString()} Messages cleared from the channel.`);
            
            theLobby.sendQueueEmbed();
        }
    }

}

module.exports.help = {
    name: "leave"
}