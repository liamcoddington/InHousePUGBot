// import Player from `${__dirname}/../playerclass.js`;
//import Player from path.basename(path.dirname('playerclass.js'));
// import { Lobby } from "";
// const Discord = require("discord.js");
const Player = require('../playerclass.js');

function getTimeString() {
    let today = new Date();
    let date = `${today.getMonth()+1}-${today.getDate()}`;
    let time = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
    return `[${date} ${time}] :`;
}

module.exports.run = async (bot, message, args) => {
    console.log(`${getTimeString()} The command 'register' has been used by ${message.author.username}.`);
    let role = message.guild.roles.find(r => r.name === "Registered");
    if (!role) {
        try {
            role = await message.guild.createRole({
                name: "Registered",
                color: "#000000",
                permissions: []
            });
        } catch (e) {
            console.log(e.stack);
        }
    }

    let user = message.author;
    if (user) {
        let member = message.guild.member(user);
        if (member) {
            member.addRole(role);

            let tempPlayer;
            if (!bot.players.find((player) => {
                tempPlayer = player;
                return player.discordid === message.author.id;
            })) {
                let player = new Player(null, bot, bot.players.length, message.author.id, message.author.tag, args.join(" ") || message.author.username);
                bot.activeplayers[player.playerid] = player;
                player.setMMRNickname(member);
                message.reply(`You have been registered with the username ${args.join(" ") || message.author.username}`);
            } else {
                bot.activeplayers[tempPlayer.playerid].setPlayerName(args.join(" ") || message.author.username);
                bot.activeplayers[tempPlayer.playerid].setMMRNickname(member);
                message.reply(`Your name has been changed to ${args.join(" ") || message.author.username}`);
            }
        }
    }
}

module.exports.help = {
    name: "register"
}