//import { DiscordAPIError, MessageReaction } from "discord.js";
const Discord = require('discord.js');
const fs = require("fs");
const Player = require('./playerclass');
const Game = require('./gameclass');

/**
 * @returns a string in the format `[MM-DD hh:mm:ss] :`
 * 
 * This function creates a new instance of Date and then finds the month,
 *  day of the month, hour, minute, and second.
 */
function getTimeString() {
    let today = new Date();
    let date = `${today.getMonth() + 1}-${today.getDate()}`;
    let time = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
    return `[${date} ${time}] :`;
}

/**
 * @param {Player[]} players is an array of Player instances (doesn't need to be in order)
 * @returns a non-negative integer value
 */
function getAverageRating(players) {
    let average = 0;
    for (let player of players) {
        average += player.mmr;
    }
    return average / players.length;
}

/**
 * @param {Player[]} players is an array of Player instances (that should be in order)
 * @returns a non-negative value between 0.9 and 1
 */
function getRoleSkill(players) {
    let roleSkill = 0;
    for (let i = 0; i < players.length; i++) {
        if (players[i].isPrimary(i)) {
            roleSkill += 1;
        } else if (players[i].isSecondary(i)) {
            roleSkill += 0.95;
        } else {
            roleSkill += 0.9;
        }
    }
    return roleSkill / players.length;
}

/**
 * @param {Player[]} players is an array of Player instances (that should be in positional order)
 * @returns a non-negative integer 'skill' value based off of different variables
 */
function getTeamSkill(players) {
    let averageRating = getAverageRating(players);
    console.log(`${getTimeString()} Average Rating: ${averageRating}`); 
    let roleSkillDelta = getRoleSkill(players);
    console.log(`${getTimeString()} Role Skill Delta: ${roleSkillDelta}`);
    let teamSynergy = getTeamSynergy(players);
    console.log(`${getTimeString()} Team Synergy: ${teamSynergy}`);
    return Math.round(averageRating * roleSkillDelta * teamSynergy);
}

/**
 * @param {Player[]} players is an array of Player instances
 * @returns a non-negative value
 */
function getTeamSynergy(players) {
    let teamSynergy = 0;
    for (let player of players) {
        let playerSynergy = 0;
        for (let teammate of players) {
            if (player != teammate) {
                playerSynergy += player.getPlayerSynergy(teammate);
            }
        }
        teamSynergy += playerSynergy / (players.length - 1);
    }
    return teamSynergy / players.length;
}

/**
 * WARNING: This function can return negative as oppposed to the similar function in gameclass.js
 * @param {Player[]} team1 is an array of Player instances (that should be in positional order)
 * @param {Player[]} team2 is an array of Player instances (that should be in positional order)
 * @returns a non-negative integer value of the difference in team Skill level
 */
function getSkillDelta(team1, team2) {
    return getTeamSkill(team2) - getTeamSkill(team1);
}

/**
 * @param {Player[]} team1 is an array of Player instances
 * @param {Player[]} team2 is an array of 
 */
function expectedResult(team1, team2) {
    return (1 / (1 + Math.pow(10, (getSkillDelta(team1, team2) / 400))));
}

/**
 * NOTE: this function could possibly be abused by players changing their roles before the MMR results are applied
 * @param {Player} player is the player to get the role information from
 * @param {Number} position is the positional order number the player is in
 * @returns either 0 for primary, 0.15 for secondary, or 0.25 for filled
 */
function roleResult(player, position) {
    if (player.isPrimary(position)) {
        return 0;
    } else if (player.isSecondary(position)) {
        return 0.15;
    } else {
        return 0.25;
    }
}

/**
 * NOTE: Win/loss counter and streaks are updated here
 * @param {Player} player is the player to get the streak information from
 * @param {Boolean} won is a boolean for whether or not the player won
 * @returns a number between -0.5 and 0.5
 */
function streakResult(player, won) {
    if (won) {
        player.addWinStreak();
        if (player.winStreak < 3) {
            return 0;
        } else if (player.winStreak < 12) {
            return (player.winStreak - 2) * 0.05;
        } else {
            return 0.5;
        }
    } else {
        player.addLossStreak();
        if (player.lossStreak < 3) {
            return 0;
        } else if (player.lossStreak < 12) {
            return -(player.lossStreak - 2) * 0.05;
        } else {
            return -0.5;
        }
    }
}

/**
 * @param {Player} player 
 * @param {Number} expected 
 * @param {Number} position 
 * @param {Boolean} won 
 */
function getResult(player, expected, position, won) {
    let result = 0;
    if (won) {
        result = 1;
    }
    return (32 * (result - expected + roleResult(player, position) + streakResult(player, won)));
}


class Lobby {
    constructor(bot, teamSize, channelid) {
        this.bot = bot;
        this.queueList = []; // Array of Players in the queue
        this.teamSize = teamSize; // Per team (2x for total amount per game)
        this.channelid = channelid; // Discord text channel

        this.lobbyid;
        let tempLobby;

        // Might be a redundant check
        if (!bot.lobbies.find((lobby) => {
            tempLobby = lobby;
            return lobby.channelid === this.channelid;
        })) {
            this.lobbyid = bot.lobbies.length;
            bot.lobbies[this.lobbyid] = {
                lobbyid: this.lobbyid,
                channelid: this.channelid,
                playersperteam: 5,
                gamesplayed: 0,
                history: [{}]
            }
            fs.writeFile('./data/lobbies.json', JSON.stringify(bot.lobbies, null, 4), err => {
                if (err) throw err;
                console.log(`${getTimeString()} Lobby #${this.lobbyid} has been created.`)
            });
        } else {
            this.lobbyid = tempLobby.lobbyid;
        }

        this.history = [...bot.lobbies[this.lobbyid].history];

        this.gameList = [];
    }



    setWinner(gameid, winner) {
        console.log(`${getTimeString()} Attempting to apply the results of game #${gameid}, winner: ${winner}`);
        if (this.history[gameid] != null) {
            if (this.history[gameid].winner === null) {
                this.history[gameid].winner = winner;
                // ASSIGN ALL MMR/STAT CHANGES HERE
                let winningTeam = []; // Should be in positional order
                let losingTeam = [];  // Should be in positional order
                let players = [...this.history[gameid].players.split(', ')];
                for (let i = 0; i < this.teamSize; i++) {
                    if (winner === "team1") {
                        winningTeam.push(this.bot.activeplayers[players[i]]);
                        losingTeam.push(this.bot.activeplayers[players[i + this.teamSize]]);
                    } else {
                        losingTeam.push(this.bot.activeplayers[players[i]]);
                        winningTeam.push(this.bot.activeplayers[players[i + this.teamSize]]);
                    }
                }

                let winningTeamExpected = expectedResult(winningTeam, losingTeam);
                let losingTeamExpected = expectedResult(losingTeam, winningTeam);
                console.log(`${getTimeString()} Winning Team Expected: ${winningTeamExpected}`);
                console.log(`${getTimeString()} Losing Team Expected: ${losingTeamExpected}`);
                for (let j = 0; j < this.teamSize; j++) {
                    let winningDelta = Math.round(getResult(winningTeam[j], winningTeamExpected, j, true));
                    let losingDelta = Math.round(getResult(losingTeam[j], losingTeamExpected, j, false));
                    let winningPlayer = winningTeam[j];
                    let losingPlayer = losingTeam[j];

                    console.log(`${getTimeString()} Winning MMR Delta: ${winningDelta}`);
                    console.log(`${getTimeString()} Losing MMR Delta: ${losingDelta}`);

                    // Apply Game History
                    winningPlayer.setHistory(gameid);
                    losingPlayer.setHistory(gameid);

                    // Apply MMR
                    winningPlayer.applyMMR(winningDelta);
                    losingPlayer.applyMMR(losingDelta);

                    // Apply Role Preference MMR Delta
                    if (winningPlayer.isPrimary(j)) {
                        winningPlayer.setprimarymmrdelta(winningDelta);
                    } else if (winningPlayer.isSecondary(j)) {
                        winningPlayer.setsecondarymmrdelta(winningDelta);
                    } else {
                        winningPlayer.setfillmmrdelta(winningDelta);
                    }

                    if (losingPlayer.isPrimary(j)) {
                        losingPlayer.setprimarymmrdelta(losingDelta);
                    } else if (losingPlayer.isSecondary(j)) {
                        losingPlayer.setsecondarymmrdelta(losingDelta);
                    } else {
                        losingPlayer.setfillmmrdelta(losingDelta);
                    }

                    // Apply Positional MMR Delta
                    switch (j) {
                        case 0:
                            winningPlayer.settopmmrdelta(winningDelta);
                            losingPlayer.settopmmrdelta(losingDelta);
                            break;
                        case 1:
                            winningPlayer.setjunglemmrdelta(winningDelta);
                            losingPlayer.setjunglemmrdelta(losingDelta);
                            break;
                        case 2:
                            winningPlayer.setmidmmrdelta(winningDelta);
                            losingPlayer.setmidmmrdelta(losingDelta);
                            break;
                        case 3:
                            winningPlayer.setbotmmrdelta(winningDelta);
                            losingPlayer.setbotmmrdelta(losingDelta);
                            break;
                        case 4:
                            winningPlayer.setsupportmmrdelta(winningDelta);
                            losingPlayer.setsupportmmrdelta(losingDelta);
                            break;
                    }

                    // Apply Synergy Record
                    for (let k = 0; k < this.teamSize; k++) {
                        if (j != k) {
                            winningPlayer.setSynergyRecord(winningTeam[k].playerid, true);
                            losingPlayer.setSynergyRecord(losingTeam[k].playerid, false);
                        }
                    }
                }
                fs.writeFile('./data/lobbies.json', JSON.stringify(this.bot.lobbies, null, 4), err => {
                    if (err) throw err;
                });
                fs.writeFile('./data/players.json', JSON.stringify(this.bot.players, null, 4), err => {
                    if (err) throw err;
                });
                console.log(`${getTimeString()} The Game ${gameid} from lobby ${this.lobbyid}, has declared its winner as ${winner}`);
            } else {
                console.log(`${getTimeString()} This game already had a recorded winner.`);
            }
        } else {
            console.log(`${getTimeString()} The Game #${gameid} does not exist in the game history.`);
        }
    }

    getQueueString() {
        let queueString = ``;
        for (let i = 0; i < this.queueList.length; i++) {
            let thePlayer = this.bot.activeplayers[this.queueList[i]];
            if (thePlayer != null) {
                queueString += `${thePlayer.getPlayerName()}\t\t(${thePlayer.primaryrolepref})\n`;
            }
        }
        if (queueString === ``) {
            queueString = `Empty...`;
        }
        return queueString;
    }

    playerInQueue(playerid) {
        return this.queueList.includes(playerid);
    }

    addPlayerQueue(playerid) {
        if (this.playerInQueue(playerid)) {
            return;
        }
        if (this.queueList.length < (this.teamSize * 2)) {
            if (this.bot.activeplayers[playerid] != null) {
                //this.queueList.push(this.bot.activeplayers[playerid]);
                this.queueList.push(playerid);
                console.log(`${getTimeString()} The Player, ${this.bot.players[playerid].name} (${playerid}), was added to the queue. {${this.channelid}}`);
                if (this.queueList.length === (this.teamSize * 2)) {
                    console.log(`${getTimeString()} The queue is full and will now create a game.`);
                    this.createGame(this.queueList);
                }
            } else {
                console.log(`${getTimeString()} The Player with the id, ${playerid}, does not exist. {${this.channelid}}`);
            }
        } else {
            console.log(`${getTimeString()} The Player, ${this.bot.players[playerid].name} (${playerid}), failed to be added to the queue because the queue is already full. {${this.channelid}}`);
        }
    }

    removePlayerQueue(playerid) {
        if (this.playerInQueue(playerid)) {
            let newQueue = [];
            for (let playerInQueue of this.queueList) {
                if (playerInQueue != playerid) {
                    newQueue.push(playerInQueue);
                }
            }
            this.queueList = [];
            this.queueList = [...newQueue];
            console.log(`${getTimeString()} The Player, ${this.bot.players[playerid].name} (${playerid}), was removed from the queue. {${this.channelid}}`)
        } else {
            console.log(`${getTimeString()} The Player, ${this.bot.players[playerid].name} (${playerid}), failed to be removed from the queue because the Player is in the queue. {${this.channelid}}`)
        }
    }

    resetPlayerQueue() {
        this.queueList = [];
    }

    sendQueueEmbed() {
        let embed = new Discord.RichEmbed()
            .setAuthor(`Lobby ${this.queueList.length}/${this.teamSize * 2}`)
            .setDescription(`This queue requires ${this.teamSize * 2} players to start a game.\nPlayers left to start the game: ${(this.teamSize * 2) - this.queueList.length}`)
            .setColor("#9B59B6")
            .addField("Players in queue", `${this.getQueueString()}`);

        let channel = this.bot.channels.get(this.channelid);
        channel.send(embed);
        // .then(MessageReaction => {
        //     const collector = MessageReaction.message
        //         .createReactionCollector(reactionFilter, {
        //             time: 15000
        //         });

        //     collector.on('collect', r => {
        //         let newEmbed = new Discord.RichEmbed({
        //             title: embed.title,
        //             description: embed.description,
        //             color: embed.color
        //         });
        //         newEmbed.addField("Players in queue", `${this.getQueueString()}`)
        //         r.message.edit(newEmbed)
        //             .then(newMsg => console.log(`${getTimeString()} New embed created and updated`))
        //             .catch(console.log);
        //     })
        //     collector.on('end', collected => console.log(`${getTimeString()} Collected ${collected.size} reactions.`));
        // })
        // .catch(console.log);
    }

    createGame(playerList) {
        let allPlayersAvailable = true;
        if (this.gameList.length > 0) {
            for (let game in this.gameList) {
                for (let player in playerList) {
                    if (game.playerList.includes(player)) {
                        console.log(`${getTimeString()} The player ${player} is already in another game.`);
                        this.removePlayerQueue(player);
                        allPlayersAvailable = false;
                    }
                }
            }
        }

        if (allPlayersAvailable) {
            console.log(`${getTimeString()} Player list before finding teams: ${playerList.toString()}`)
            let nextGame = new Game(this.bot, this.lobbyid, playerList, null, null, null);
            this.gameList[this.gameList.length] = nextGame;
            this.history[nextGame.gameid] = this.bot.lobbies[this.lobbyid].history[nextGame.gameid];
            this.resetPlayerQueue();

            let channel = this.bot.channels.get(this.channelid);
            nextGame.sendStatsEmbed(channel);
        }
    }
}


module.exports = Lobby;