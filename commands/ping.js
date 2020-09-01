// const Discord = require("discord.js");

function getTimeString() {
    let today = new Date();
    let date = `${today.getMonth()+1}-${today.getDate()}`;
    let time = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
    return `[${date} ${time}] :`;
}

module.exports.run = async (bot, message, args) => {
    console.log(`${getTimeString()} The command 'ping' has been used by ${message.author.username}.`);
    message.channel.send("pong");
}

module.exports.help = {
    name: "ping"
}