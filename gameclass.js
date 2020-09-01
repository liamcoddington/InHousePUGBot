//import { DiscordAPIError, Client } from "discord.js";
const Discord = require('discord.js');
const fs = require("fs");
const Player = require('./playerclass');

/**
 * @returns a string in the format `[MM-DD hh:mm:ss] :`
 * 
 * This function creates a new instance of Date and then finds the month,
 *  day of the month, hour, minute, and second.
 */
function getTimeString() {
    let today = new Date();
    let date = `${today.getMonth()+1}-${today.getDate()}`;
    let time = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
    return `[${date} ${time}] :`;
}

/**
 * @param {Player[]} players is an array of Player instances (that should be in positional order)
 * @returns a boolean that is true if it is a valid team and false if it is not a valid team
 * 
 * This function iterates through the list of Player instances in-order and checks to see if any
 *  player is in a position that they have set as a nevergetrole
 */
function isValidTeam(players) {
    // console.log(`${getTimeString()} isValidTeam players: ${players.toString()}`);
    for (let i = 0; i < players.length; i++) {
        if (players[i].isNeverGet(i)) {
            return false;
        }
    }
    return true;
}

/**
 * @param {Player[]} players is an array of Player instances (that should be in positional order)
 * @returns the number of players in their primary position
 */
function getPrimaries(players) {
    let num = 0;
    for (let i = 0; i < players.length; i++) {
        if (players[i].isPrimary(i)) {
            num++;
        }
    }
    return num;
}

/**
 * @param {Player[]} players is an array of Player instances (that should be in positional order)
 * @returns the number of players in their secondary position
 */
function getSecondaries(players) {
    let num = 0;
    for (let i = 0; i < players.length; i++) {
        if (players[i].isSecondary(i)) {
            num++;
        }
    }
    return num;
}

/**
 * @param {Player[]} players is an array of Player instances (that should be in positional order)
 * @returns the number of players in a filled position
 */
function getFills(players) {
    let num = 0;
    for (let i = 0; i < players.length; i++) {
        if (players[i].isFill(i)) {
            num++;
        }
    }
    return num;
}

/**
 * @summary This function uses functions of the Player classes to find how many primaries, secondaries,
 *      and fills are on a team and then returns a number between -1 and 1 that is decided by the following
 *      equation: ((number of fills) * -0.3) + ((number of secondaires) * 0.05) + ((number of primaries) * 0.2)
 * @param {Player[]} players is an array of Player instances (that should be in positional order)
 * @returns a value between -1 and 1 based off of the number of primaries, secondaries, and fill on a team
 */
function getTeamPositionalScore(players) {
    // 0 fills 0 secondaries 5 primaries,   0  +  0   +  1  =  1.0
    // 0 fills 1 secondary   4 primaries,   0  + 0.05 + 0.8 =  0.85
    // 0 fills 2 secondaries 3 primaries,   0  + 0.1  + 0.6 =  0.7
    // 0 fills 3 secondaries 2 primaries,   0  + 0.15 + 0.4 =  0.55
    // 1 fill  0 secondaries 4 primaries, -0.3 +  0   + 0.8 =  0.5
    // 0 fills 4 secondaries 1 primary  ,   0  + 0.2  + 0.2 =  0.4
    // 1 fill  1 secondary   3 primaries, -0.3 + 0.05 + 0.6 =  0.35
    // 2 fills 0 secondaries 3 primaries, -0.6 +  0   + 0.6 =  0.0
    // 3 fills 0 secondaires 2 primaires, -0.9 +  0   + 0.4 = -0.5
    // 4 fills 0 secondaires 1 primary  , -1.2 +  0   + 0.2 = -1.0

    let fillValue = (getFills(players) * -0.3);
    let secondaryValue = (getSecondaries(players) * 0.05);
    let primaryValue = (getPrimaries(players) * 0.2);
    let teamPositionalScore = fillValue + secondaryValue + primaryValue;
    // console.log(`${getTimeString()} Team Positional Score: ${teamPositionalScore}, Primary Value: ${primaryValue}, Secondary Value: ${secondaryValue}, Fill Value: ${fillValue}`);
    // if the position score is <= 0 this team should not be forced to play (-1 makes it impossible for this team to play)
    if (teamPositionalScore <= 0) {
        teamPositionalScore = -1;
    }
    return teamPositionalScore;
}

/**
 * @param {Player[]} team1 is an array of Player instances (that should be in positional order)
 * @param {Player[]} team2 is an array of Player instances (that shoudl be in positional order)
 * @returns a value between -1 and 1 that represents a 'positional' value based off of positional variables
 */
function getPositionalScore(team1, team2) {
    let positionalScore = getTeamPositionalScore(team1) + getTeamPositionalScore(team2);
    // just in case dividing 0 causes an error, even though it shouldn't be a problem
    if (positionalScore === 0) {
        return 0;
    } else {
        return positionalScore / 2;
    }
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
 * @param {Player[]} players is an array of Player instances (that should be in positional order)
 * @returns a non-negative integer 'skill' value based off of different variables
 */
function getTeamSkill(players) {
    let averageRating = getAverageRating(players);
    let roleSkillDelta = getRoleSkill(players);
    let teamSynergy = getTeamSynergy(players);
    return Math.round(averageRating * roleSkillDelta * teamSynergy);
}

/**
 * @param {Player[]} team1 is an array of Player instances (that should be in positional order)
 * @param {Player[]} team2 is an array of Player instances (that should be in positional order)
 * @returns a non-negative integer value of the difference in team Skill level
 */
function getSkillDelta(team1, team2) {
    return Math.abs(getTeamSkill(team1) - getTeamSkill(team2));
}

/**
 * @param {Player[]} team1 is an array of Player instances (that should be in positional order)
 * @param {Player[]} team2 is an array of Player instances (that should be in positional order)
 * @returns a non-negative value between 0 and 1 that represents a quality of game score based off of team skill and positional score
 */
function getQualityScore(team1, team2) {
    let skillScore = getSkillDelta(team1, team2) + 1;
    if (skillScore > 250) {
        skillScore = 251;
    }
    // skillScore at this point is a value between 1 and 251 (not 0 and 250 to prevent dividing 0 even though it shouldn't cause an error)
    skillScore = (skillScore / 250) - (1 / 250);
    // skillScore at this point is a value between 0 and 1
    // 0 being lower skill difference, 1 being a skill difference of 250 or greater (the lower the better)
    // console.log(`${getTimeString()} Skill Score being checked in getQualityScore(): ${skillScore}`);

    let qualityScore = getPositionalScore(team1, team2) - skillScore;
    // console.log(`${getTimeString()} Quality Score being checked in getQualityScore(): ${qualityScore}`);
    if (qualityScore < 0) { // if the quality score is < 0 then this matchup is not good
        qualityScore = 0;
    }
    return qualityScore;
}

/**
 * @summary This function permutes through all permutations of the array of Player instances passed
 *      into the function and based off of other functions it will find the most even match.
 * @param {Player[]} players is an array of Player instances
 * @returns an array of Player instances in order of:
 *      [0] Team 1 Top,
 *      [1] Team 1 Jungle,
 *      [2] Team 1 Mid,
 *      [3] Team 1 Bot,
 *      [4] Team 1 Support,
 *      [5] Team 2 Top,
 *      [6] Team 2 Jungle,
 *      [7] Team 2 Mid,
 *      [8] Team 2 Bot,
 *      [9] Team 2 Support
 *      IF the function returns an empty array, NO permutation of the list of players is suitable.
 */
function createBalancedGame(players) {
    let currentBest = [];
    let currentBestQualityScore = 0;

    function* permute(permutation) {
        let length = permutation.length,
            c = Array(length).fill(0),
            i = 1, k, p;

        yield permutation.slice();
        while (i < length) {
            if (c[i] < i) {
                k = i % 2 && c[i];
                p = permutation[i];
                permutation[i] = permutation[k];
                permutation[k] = p;
                ++c[i];
                i = 1;
                yield permutation.slice();
            } else {
                c[i] = 0;
                ++i;
            }
        }
    }

    for (let permutation of permute(players)) {
        // console.log(`${getTimeString()} Permutation: ${permutation}`);
        let team1 = [];
        let team2 = [];
        for (let m = 0; m < players.length / 2; m++) {
            team1[m] = permutation[m];
            team2[m] = permutation[m + (players.length / 2)];
        }
        if (isValidTeam(team1) && isValidTeam(team2)) {
            let qualityScore = getQualityScore(team1, team2);
            if (qualityScore > currentBestQualityScore) {
                // console.log(`${getTimeString()} Next Best quality score: ${qualityScore}`);
                currentBestQualityScore = qualityScore;
                currentBest = [];
                currentBest = [...permutation];
            }
        }
    }
    return currentBest;
}



class Game {
    /**
     * @summary Game class constructor, used for creating the game with a list of players.
     * 
     * @param {*} bot is the instance of the discord bot (used for accessing players & lobbies JSONs)
     * @param {*} lobbyid is the Discord channel the lobby is in (used for JSON storage)
     * @param {Number[]} allPlayers is an array of all the players in the game in no particular order
     * @param {Player[]} team1 is an array of all the players on team 1 in standard positional order
     * @param {Player[]} team2 is an array of all the plaerys on team 2 in standard positional order
     */
    constructor(bot, lobbyid, allPlayers, team1, team2, winner) {
        this.bot = bot;
        this.lobbyid = lobbyid;
        this.thePlayers = [];

        this.team1;
        this.team2;
        this.winner;

        // Initialize & create Teams
        if (team1 === null) {
            this.winner = null;
            this.team1 = [];
            this.team2 = [];
            let tempPlayers = [];
            for (let i = 0; i < allPlayers.length; i++) {
                tempPlayers[i] = this.bot.activeplayers[allPlayers[i]];
            }
            this.thePlayers = [];
            console.log(`${getTimeString()} Unsorted players before balanced game checker: ${tempPlayers.toString()}`)
            this.thePlayers = createBalancedGame(tempPlayers);
            console.log(`${getTimeString()} Sorted players after balanced game checker: ${this.thePlayers.toString()}`)
            for (let j = 0; j < (this.thePlayers.length / 2); j++) {
                this.team1[j] = this.thePlayers[j];
                this.team2[j] = this.thePlayers[j + (this.thePlayers.length / 2)];
            }
            console.log(`${getTimeString()} Balanced teams were created.`);
            console.log(`${getTimeString()} Team1: ${this.team1.toString()}`);
            console.log(`${getTimeString()} Team2: ${this.team2.toString()}`);
        } else {
            // unsure how to fix this
            // this.team1 = [...team1];
            // this.team2 = [...team2];
            // this.winner = winner;
        }

        // Record Stats
        this.stats = {
            qualityScore : getQualityScore(this.team1, this.team2),     // this.stats.quilityScore

            skillDelta : getSkillDelta(this.team1, this.team2),         // this.stats.skillDelta

            team1 : {
                averageMMR : getAverageRating(this.team1),              // this.stats.team1.averageMMR
                primaries : getPrimaries(this.team1),                   // this.stats.team1.primaries
                secondaries : getSecondaries(this.team1),               // this.stats.team1.secondaries
                fills : getFills(this.team1),                           // this.stats.team1.fills
                positionalScore : getTeamPositionalScore(this.team1),   // this.stats.team1.positionalScore
                teamSynergy : getTeamSynergy(this.team1)                // this.stats.team1.teamSynergy
            },

            team2 : {
                averageMMR : getAverageRating(this.team2),              // this.stats.team2.averageMMR
                primaries : getPrimaries(this.team2),                   // this.stats.team2.primaries
                secondaries : getSecondaries(this.team2),               // this.stats.team2.secondaries
                fills : getFills(this.team2),                           // this.stats.team2.fills
                positionalScore : getTeamPositionalScore(this.team2),   // this.stats.team2.positionalScore
                teamSynergy : getTeamSynergy(this.team2)                // this.stats.team2.teamSynergy
            }
        };
        this.stats.qualityScore = getQualityScore(this.team1, this.team2);

        this.stats.skillDelta = getSkillDelta(this.team1, this.team2);

        this.stats.team1.teamSkill = getTeamSkill(this.team1);
        this.stats.team2.teamSkill = getTeamSkill(this.team2);

        this.stats.team1.averageMMR = getAverageRating(this.team1);
        this.stats.team2.averageMMR = getAverageRating(this.team2);

        this.stats.team1.primaries = getPrimaries(this.team1);
        this.stats.team2.primaries = getPrimaries(this.team2);

        this.stats.team1.secondaries = getSecondaries(this.team1);
        this.stats.team2.secondaries = getSecondaries(this.team2);

        this.stats.team1.fills = getFills(this.team1);
        this.stats.team2.fills = getFills(this.team2);

        this.stats.team1.positionalScore = getTeamPositionalScore(this.team1);
        this.stats.team2.positionalScore = getTeamPositionalScore(this.team2);
        
        this.stats.team1.teamSynergy = getTeamSynergy(this.team1);
        this.stats.team2.teamSynergy = getTeamSynergy(this.team2);

        // Create game in JSON
        this.gameid;
        if (typeof bot.lobbies[lobbyid].history === "undefined") {
            this.gameid = 0;
        } else {
            this.gameid = bot.lobbies[lobbyid].history.length;
        }
        let idArray = [];
        for (let k = 0; k < this.thePlayers.length; k++) {
            idArray.push(this.thePlayers[k].playerid);
        }
        bot.lobbies[lobbyid].history[this.gameid] = {
            gameid: this.gameid,
            players: idArray.join(", "),
            winner: this.winner
        };
        fs.writeFile('./data/lobbies.json', JSON.stringify(bot.lobbies, null, 4), err => {
            if (err) throw err;
            console.log(`${getTimeString()} Game #${this.gameid} created for Lobby #${lobbyid}.`);
        });
    }

    getTeamString(players) {
        let teamString = ``;
        for (let i = 0; i < players.length; i++) {
            let thePlayer = players[i];
            let positionString = ``;
            switch (i) {
                case 0:
                    positionString = `Top:  `;
                    break;
                case 1:
                    positionString = `Jungle:  `;
                    break;
                case 2:
                    positionString = `Mid:  `;
                    break;
                case 3:
                    positionString = `Bot:  `;
                    break;
                case 4:
                    positionString = `Support:  `;
                    break;
            }
            teamString += positionString;
            teamString += `${thePlayer.getPlayerName()}\t\t`
            if (thePlayer.isPrimary(i)) {
                teamString += `(Primary)\n`;
            } else if (thePlayer.isSecondary(i)) {
                teamString += `(Secondary)\n`;
            } else {
                teamString += `(Filled)\n`;
            }
        }
        console.log(`${getTimeString()} Team size: ${players.length}, Team String: ${teamString}`);
        return teamString;
    }

    sendStatsEmbed(channel) {
        let embed = new Discord.RichEmbed()
            .setAuthor(`Game #${this.gameid}`)
            .setColor("#9B59B6")
            .addField(`Team 1 Players`, `${this.getTeamString(this.team1)} `)
            .addField(`Team 1 Team Skill`, `${this.stats.team1.teamSkill}`)
            .addField(`Team 1 Average MMR`, `${this.stats.team1.averageMMR}`)
            .addField(`Team 1 Positional Score`, `${this.stats.team1.positionalScore}`)
            .addField(`Team 1 Team Synergy`, `${this.stats.team1.teamSynergy}`)
            .addField(`Team 2 Players`, `${this.getTeamString(this.team2)}`)
            .addField(`Team 2 Team Skill`, `${this.stats.team2.teamSkill}`)
            .addField(`Team 2 Average MMR`, `${this.stats.team2.averageMMR}`)
            .addField(`Team 2 Positional Score`, `${this.stats.team2.positionalScore}`)
            .addField(`Team 2 Team Synergy`, `${this.stats.team2.teamSynergy}`);
        channel.send(embed);
    }
}

module.exports = Game;