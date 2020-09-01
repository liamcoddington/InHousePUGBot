const botconfig = require("./botconfig.json");
const tokenfile = require("./token.json");
const Discord = require("discord.js");
const fs = require("fs");
const bot = new Discord.Client({
    // ws: {
    //     intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_EMOJIS', 'GUILD_PRESENCES', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS']
    // },
    // ws: {
    //     intents: ['GUILD_EMOJIS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS']
    // },
    disableEveryone: true
});
const Player = require("./playerclass");
const Lobby = require("./lobbyclass");

bot.commands = new Discord.Collection();
bot.players = require('./data/players.json');
bot.lobbies = require('./data/lobbies.json');
bot.activeplayers = [];
bot.activelobbies = [];

function getTimeString() {
    let today = new Date();
    let date = `${today.getMonth() + 1}-${today.getDate()}`;
    let time = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
    return `[${date} ${time}] :`;
}


async function createActivePlayerList() {
    for (let player of bot.players) {
        let tempPlayer = new Player(player, bot, player.playerid, player.discordid, player.tag, player.name);
        bot.activeplayers[player.playerid] = tempPlayer;
        let tempMember;
        bot.guilds.find((guild) => {
            return guild.members.find((member) => {
                tempMember = member;
                return member.id === tempPlayer.discordid;
            });
        });
        tempPlayer.setMMRNickname(tempMember);
    }
    console.log(`${getTimeString()} The active player list has been created with ${bot.activeplayers.length} players.`);
}

async function createActiveLobbyList() {
    for (let lobby of bot.lobbies) {
        bot.activelobbies[lobby.lobbyid] = new Lobby(bot, 5, lobby.channelid);
    }
    console.log(`${getTimeString()} The active lobby list has been created with ${bot.activelobbies.length} lobbies.`);
}

fs.readdir("./commands/", (err, files) => {
    if (err) console.log(`${getTimeString()} ${err}`);

    let jsfile = files.filter(f => f.split(".").pop() === "js");
    if (jsfile.length <= 0) {
        console.log(`${getTimeString()} Couldn't find commands.`);
        return;
    }

    jsfile.forEach((f, i) => {
        let props = require(`./commands/${f}`);
        console.log(`${getTimeString()} ${f} loaded!`);
        bot.commands.set(props.help.name, props);
    });
});

bot.once("ready", () => {
    console.log(`${getTimeString()} ${bot.user.username} is online on ${bot.guilds.size} servers!`);
    createActivePlayerList();
    createActiveLobbyList();
});

bot.on("message", async message => {
    if (message.author.bot) return;
    if (message.channel.type === "dm") return;

    let prefix = botconfig.prefix;
    let messageArray = message.content.split(" ");
    let cmd = messageArray[0];
    let args = messageArray.slice(1);

    let commandfile = bot.commands.get(cmd.slice(prefix.length));
    if (commandfile) commandfile.run(bot, message, args);
});

bot.login(tokenfile.token);