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
    console.log(`${getTimeString()} The command 'setprimary' has been used by ${message.author.username}.`);

    let tempPlayer;
    if (bot.players.find((player) => {
        tempPlayer = player;
        return player.discordid === message.author.id;
    })) {
        let success = false;
        if (args[0].toLowerCase() === "top") {
            if (tempPlayer.secondaryrolepref === "top") {
                message.reply("Invalid primary role, your secondary role is = 'top'");
            } else if (tempPlayer.nevergetrole === "top") {
                message.reply("Invalid primary role, your never get role is = 'top'");
            } else {
                success = true;
                tempPlayer.primaryrolepref = "top";
                bot.activeplayers[tempPlayer.playerid].primaryrolepref = "top";
            }
        } else if (args[0].toLowerCase() === "jungle") {
            if (tempPlayer.secondaryrolepref === "jungle") {
                message.reply("Invalid primary role, your secondary role is = 'jungle'");
            } else if (tempPlayer.nevergetrole === "jungle") {
                message.reply("Invalid primary role, your never get role is = 'jungle'");
            } else {
                success = true;
                tempPlayer.primaryrolepref = "jungle";
                bot.activeplayers[tempPlayer.playerid].primaryrolepref = "jungle";
            }
        } else if (args[0].toLowerCase() === "mid") {
            if (tempPlayer.secondaryrolepref === "mid") {
                message.reply("Invalid primary role, your secondary role is = 'mid'");
            } else if (tempPlayer.nevergetrole === "mid") {
                message.reply("Invalid primary role, your never get role is = 'mid'");
            } else {
                success = true;
                tempPlayer.primaryrolepref = "mid";
                bot.activeplayers[tempPlayer.playerid].primaryrolepref = "mid";
            }
        } else if (args[0].toLowerCase() === "bot") {
            if (tempPlayer.secondaryrolepref === "bot") {
                message.reply("Invalid primary role, your secondary role is = 'bot'");
            } else if (tempPlayer.nevergetrole === "bot") {
                message.reply("Invalid primary role, your never get role is = 'bot'");
            } else {
                success = true;
                tempPlayer.primaryrolepref = "bot";
                bot.activeplayers[tempPlayer.playerid].primaryrolepref = "bot";
            }
        } else if (args[0].toLowerCase() === "support") {
            if (tempPlayer.secondaryrolepref === "support") {
                message.reply("Invalid primary role, your secondary role is = 'support'");
            } else if (tempPlayer.nevergetrole === "support") {
                message.reply("Invalid primary role, your never get role is = 'support'");
            } else {
                success = true;
                tempPlayer.primaryrolepref = "support";
                bot.activeplayers[tempPlayer.playerid].primaryrolepref = "support";
            }
        } else if (args[0].toLowerCase() === "fill") {
            success = true;
            tempPlayer.primaryrolepref = "fill";
            bot.activeplayers[tempPlayer.playerid].primaryrolepref = "fill";
            tempPlayer.secondaryrolepref = null;
            bot.activeplayers[tempPlayer.playerid].secondaryrolepref = null;
        } else {
            message.reply("Invalid role!\nValid roles: 'top', 'jungle', 'mid', 'bot', 'support', and 'fill' (do not include the single quotes)");
        }
        if (success) {
            if (tempPlayer.secondaryrolepref === null && args[0].toLowerCase() != "fill") {
                tempPlayer.secondaryrolepref = "fill";
                bot.activeplayers[tempPlayer.playerid].secondaryrolepref = "fill";
            }
            fs.writeFile('./data/players.json', JSON.stringify(bot.players, null, 4), err => {
                if (err) throw err;
                console.log(`${getTimeString()} Player, ${tempPlayer.playerid} has changed their primary role to ${tempPlayer.primaryrolepref}.`);
            });
            message.reply("Your primary role has been changed.");
        }
        message.channel.send(bot.activeplayers[tempPlayer.playerid].getPlayerInfoEmbed());
    } else {
        message.reply("You are not a registered player.");
    }

}

module.exports.help = {
    name: "setprimary"
}