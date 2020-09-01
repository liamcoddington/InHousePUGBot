//import { Player } from "";
//import { Lobby } from path.basename(path.dirname(filename));
//import Lobby from path.basename(path.dirname('lobbyclass.js'));
// import Lobby from `${__dirname}/../lobbyclass.js`;
// const Discord = require("discord.js");

function getTimeString() {
    let today = new Date();
    let date = `${today.getMonth()+1}-${today.getDate()}`;
    let time = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
    return `[${date} ${time}] :`;
}

module.exports.run = async (bot, message, args) => {
    console.log(`${getTimeString()} The command 'createqueue' has been used by ${message.author.username}.`);

    // Check to make sure an administrator is the one creating the queue
    let user = message.author;
    if (user) {
        let member = message.guild.member(user);
        if (member && member.roles.find (r => r.name === "Administrator")) {

            // Clearing 100 Discord messages from the channel
            console.log(`${getTimeString()} Clearing messages from the channel.`);
            async () => {
                let fetched;
                do {
                    fetched = await channel.fetchMessages({limit: 100});
                    message.channel.bulkDelete(fetched);
                }
                while(fetched.size >= 2);
            }

            // Check if this channel is already an active lobby & create one if there isn't
            let theLobby = null;
            let tempLobby = null;
            if (!bot.activelobbies.find((lobby) => {
                tempLobby = lobby;
                return lobby.discordChannel.id === message.channel.id;
            })) {
                theLobby = new Lobby(bot, 5, bot.channels.get(message.channel));
                bot.activelobbies[theLobby.lobbyid] = theLobby;
            } else {
                theLobby = tempLobby;
            }
            
            if (theLobby != null) {
                theLobby.sendQueueEmbed();
                console.log(`${getTimeString()} Queue embed message sucessfully sent.`)
            } else {
                console.log(`${getTimeString()} CRITICAL ERROR: Lobby was not able to be created. {createqueue.js}`)
            }

        }

    }





}

module.exports.help = {
    name: "createqueue"
}