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
    console.log(`${getTimeString()} The command 'setsecondary' has been used by ${message.author.username}.`);

    let tempPlayer;
    if (bot.players.find((player) => {
        tempPlayer = player;
        return player.discordid === message.author.id;
    })) {
        let success = false;
        if (args[0].toLowerCase() === "top") {
            if (tempPlayer.primaryrolepref === "top") {
                message.reply("Invalid secondary role, your primary role is = 'top'");
            } else if (tempPlayer.primaryrolepref === "fill") {
                message.reply("Invalid secondary role, your primary role is = 'fill'");
            } else if (tempPlayer.nevergetrole === "top") {
                message.reply("Invalid secondary role, your never get role is = 'top'");
            } else {
                success = true;
                tempPlayer.secondaryrolepref = "top";
                bot.activeplayers[tempPlayer.playerid].secondaryrolepref = "top";
            }
        } else if (args[0].toLowerCase() === "jungle") {
            if (tempPlayer.primaryrolepref === "jungle") {
                message.reply("Invalid secondary role, your primary role is = 'jungle'");
            } else if (tempPlayer.primaryrolepref === "fill") {
                message.reply("Invalid secondary role, your primary role is = 'fill'");
            } else if (tempPlayer.nevergetrole === "jungle") {
                message.reply("Invalid secondary role, your never get role is = 'jungle'");
            } else {
                success = true;
                tempPlayer.secondaryrolepref = "jungle";
                bot.activeplayers[tempPlayer.playerid].secondaryrolepref = "jungle";
            }
        } else if (args[0].toLowerCase() === "mid") {
            if (tempPlayer.primaryrolepref === "mid") {
                message.reply("Invalid secondary role, your primary role is = 'mid'");
            } else if (tempPlayer.primaryrolepref === "fill") {
                message.reply("Invalid secondary role, your primary role is = 'fill'");
            } else if (tempPlayer.nevergetrole === "mid") {
                message.reply("Invalid secondary role, your never get role is = 'mid'");
            } else {
                success = true;
                tempPlayer.secondaryrolepref = "mid";
                bot.activeplayers[tempPlayer.playerid].secondaryrolepref = "mid";
            }
        } else if (args[0].toLowerCase() === "bot") {
            if (tempPlayer.primaryrolepref === "bot") {
                message.reply("Invalid secondary role, your primary role is = 'bot'");
            } else if (tempPlayer.primaryrolepref === "fill") {
                message.reply("Invalid secondary role, your primary role is = 'fill'");
            } else if (tempPlayer.nevergetrole === "bot") {
                message.reply("Invalid secondary role, your never get role is = 'bot'");
            } else {
                success = true;
                tempPlayer.secondaryrolepref = "bot";
                bot.activeplayers[tempPlayer.playerid].secondaryrolepref = "bot";
            }
        } else if (args[0].toLowerCase() === "support") {
            if (tempPlayer.primaryrolepref === "support") {
                message.reply("Invalid secondary role, your primary role is = 'support'");
            } else if (tempPlayer.primaryrolepref === "fill") {
                message.reply("Invalid secondary role, your primary role is = 'fill'");
            } else if (tempPlayer.nevergetrole === "support") {
                message.reply("Invalid secondary role, your never get role is = 'support'");
            } else {
                success = true;
                tempPlayer.secondaryrolepref = "support";
                bot.activeplayers[tempPlayer.playerid].secondaryrolepref = "support";
            }
        } else if (args[0].toLowerCase() === "fill") {
            if (tempPlayer.primaryrolepref === "fill") {
                message.reply("Invalid secondary role, your primary role is already = 'fill'");
            } else {
                success = true;
                tempPlayer.secondaryrolepref = "fill";
                bot.activeplayers[tempPlayer.playerid].secondaryrolepref = "fill";
            }
        } else {
            message.reply("Invalid role!\nValid roles: 'top', 'jungle', 'mid', 'bot', 'support', and 'fill' (do not include the single quotes)");
        }
        if (success) {
            fs.writeFile('./data/players.json', JSON.stringify(bot.players, null, 4), err => {
                if (err) throw err;
                console.log(`${getTimeString()} Player, ${tempPlayer.playerid} has changed their secondary role to ${tempPlayer.secondaryrolepref}.`);
            });
            message.reply("Your secondary role has been changed.");
        }
        message.channel.send(bot.activeplayers[tempPlayer.playerid].getPlayerInfoEmbed());
    } else {
        message.reply("You are not a registered player.");
    }

}

module.exports.help = {
    name: "setsecondary"
}