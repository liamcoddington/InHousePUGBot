// import { Player } from "";
// import { Lobby } from "";
// const Discord = require("discord.js");
const fs = require("fs");

function getTimeString() {
    let today = new Date();
    let date = `${today.getMonth() + 1}-${today.getDate()}`;
    let time = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
    return `[${date} ${time}] :`;
}

module.exports.run = async (bot, message, args) => {
    console.log(`${getTimeString()} The command 'setneverget' has been used by ${message.author.username}.`);

    let tempPlayer;
    if (bot.players.find((player) => {
        tempPlayer = player;
        return player.discordid === message.author.id;
    })) {
        let success = false;
        if (args[0].toLowerCase() === "top") {
            if (tempPlayer.primaryrolepref === "top") {
                message.reply("Invalid never get role, your primary role is = 'top'");
            } else if (tempPlayer.secondaryrolepref === "top") {
                message.reply("Invalid never get role, your secondary role is = 'top'");
            } else {
                success = true;
                tempPlayer.nevergetrole = "top";
                bot.activeplayers[tempPlayer.playerid].nevergetrole = "top";
            }
        } else if (args[0].toLowerCase() === "jungle") {
            if (tempPlayer.primaryrolepref === "jungle") {
                message.reply("Invalid never get role, your primary role is = 'jungle'");
            } else if (tempPlayer.secondaryrolepref === "jungle") {
                message.reply("Invalid never get role, your secondary role is = 'jungle'");
            } else {
                success = true;
                tempPlayer.nevergetrole = "jungle";
                bot.activeplayers[tempPlayer.playerid].nevergetrole = "jungle";
            }
        } else if (args[0].toLowerCase() === "mid") {
            if (tempPlayer.primaryrolepref === "mid") {
                message.reply("Invalid never get role, your primary role is = 'mid'");
            } else if (tempPlayer.secondaryrolepref === "mid") {
                message.reply("Invalid never get role, your secondary role is = 'mid'");
            } else {
                success = true;
                tempPlayer.nevergetrole = "mid";
                bot.activeplayers[tempPlayer.playerid].nevergetrole = "mid"
            }
        } else if (args[0].toLowerCase() === "bot") {
            if (tempPlayer.primaryrolepref === "bot") {
                message.reply("Invalid never get role, your primary role is = 'bot'");
            } else if (tempPlayer.secondaryrolepref === "bot") {
                message.reply("Invalid never get role, your secondary role is = 'bot'");
            } else {
                success = true;
                tempPlayer.nevergetrole = "bot";
                bot.activeplayers[tempPlayer.playerid].nevergetrole = "bot";
            }
        } else if (args[0].toLowerCase() === "support") {
            if (tempPlayer.primaryrolepref === "support") {
                message.reply("Invalid never get role, your primary role is = 'support'");
            } else if (tempPlayer.secondaryrolepref === "support") {
                message.reply("Invalid never get role, your secondary role is = 'support'");
            } else {
                success = true;
                tempPlayer.nevergetrole = "support";
                bot.activeplayers[tempPlayer.playerid].nevergetrole = "support";
            }
        } else if (args[0].toLowerCase() === "none") {
            success = true;
            tempPlayer.nevergetrole = null;
            bot.activeplayers[tempPlayer.playerid].nevergetrole = null;
        } else {
            message.reply("Invalid role!\nValid roles: 'top', 'jungle', 'mid', 'bot', 'support', and 'none' (do not include the single quotes)");
        }
        if (success) {
            fs.writeFile('./data/players.json', JSON.stringify(bot.players, null, 4), err => {
                if (err) throw err;
                console.log(`${getTimeString()} Player, ${tempPlayer.playerid} has changed their never get role to ${tempPlayer.secondaryrolepref}.`);
            });
            message.reply("Your never get role has been changed.");
        }
        message.channel.send(bot.activeplayers[tempPlayer.playerid].getPlayerInfoEmbed());
    } else {
        message.reply("You are not a registered player.");
    }

}

module.exports.help = {
    name: "setneverget"
}