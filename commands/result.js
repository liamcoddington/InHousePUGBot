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
    console.log(`${getTimeString()} The command 'result' has been used by ${message.author.username}.`);
    
    let roleMod = message.guild.roles.find(r => r.name === "Moderator");
    let roleAdm = message.guild.roles.find(r => r.name === "Administrator");
    if (!roleMod && !roleAdm) {
        message.reply("The Moderator/Administrator role does not exist on this server.");
    } else {
        let user = message.author;
        if (user) {
            let member = message.guild.member(user);
            if (member) {
                if (member.roles.find(r => r.name === "Moderator") || member.roles.find(r => r.name === "Administrator")) {
                    let tempLobby;
                    let argLobby = args[0].substring(2, (args[0].length - 1));
                    if (bot.activelobbies.find((lobby) => {
                        tempLobby = lobby;
                        return lobby.channelid === argLobby;
                    })) {
                        let tempGame;
                        let argGame = parseInt(args[1]);
                        if (tempLobby.history.find((game) => {
                            tempGame = game;
                            if (game === null) {
                                return false;
                            }
                            if (typeof game === "undefined") {
                                return false;
                            }
                            //console.log(`${getTimeString()} Game: ${game}`);
                            return game.gameid === argGame;
                        })) {
                            if (tempGame.winner != null) {
                                message.reply("This game has already been Recorded");
                            } else {
                                let argWinner = args[2];
                                let success = false;
                                let winner = null;
                                if (argWinner.toLowerCase() === "team1") {
                                    success = true;
                                    winner = "team1";
                                } else if (argWinner.toLowerCase() === "team2") {
                                    success = true;
                                    winner = "team2";
                                } else {
                                    message.reply("Invalid winning team!\nValid teams: 'team1' or 'team2' (do not include the single quotes)")
                                }
                                if (success) {
                                    tempLobby.setWinner(tempGame.gameid, winner);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

}

module.exports.help = {
    name: "result"
}