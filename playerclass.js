//import { DiscordAPIError } from "discord.js";
const Discord = require('discord.js');
const fs = require("fs");

const PRIMARY_ROLE = {
    TOP: "top",
    JUNGLE: "jungle",
    MID: "mid",
    BOT: "bot",
    SUPPORT: "support",
    FILL: "fill"
}
const SECONDARY_ROLE = {
    TOP: "top",
    JUNGLE: "jungle",
    MID: "mid",
    BOT: "bot",
    SUPPORT: "support",
    FILL: "fill",
    NONE: "none"
}
const NEVER_GET_ROLE = {
    TOP: "top",
    JUNGLE: "jungle",
    MID: "mid",
    BOT: "bot",
    SUPPORT: "support",
    NONE: "none"
}

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


class Player {
    constructor(playerjson, bot, playerid, discordid, tag, name, initial) {
        this.bot = bot;

        // Standard Player JSON
        this.playerid = playerid;
        this.discordid = discordid;
        this.tag = tag;
        this.name = name;
        this.mmr = 1500;
        this.wins = 0;
        this.losses = 0;
        this.winstreak = 0;
        this.lossstreak = 0;
        this.topmmrdelta = 0;
        this.junglemmrdelta = 0;
        this.midmmrdelta = 0;
        this.botmmrdelta = 0;
        this.supportmmrdelta = 0;
        this.primarymmrdelta = 0;
        this.secondarymmrdelta = 0;
        this.fillmmrdelta = 0;
        this.primaryrolepref = PRIMARY_ROLE.FILL;
        this.secondaryrolepref = SECONDARY_ROLE.NONE;
        this.nevergetrole = NEVER_GET_ROLE.NONE;
        this.history = [];
        this.synergyrecord = [{}];


        if (playerjson != null) {
            // Overwrite default values (with ones in the JSON file)
            //console.log(`${getTimeString()} playerjson primary:${playerjson.primary}, playerjson primaryrolepref:${playerjson.primaryrolepref}, bot.players[pid].primaryrolepref:${bot.players[this.playerid].primaryrolepref}`)
            this.mmr = playerjson.mmr;
            this.wins = playerjson.wins;
            this.losses = playerjson.losses;
            this.winstreak = playerjson.winstreak;
            this.lossstreak = playerjson.lossstreak;
            this.topmmrdelta = playerjson.topmmrdelta;
            this.junglemmrdelta = playerjson.junglemmrdelta;
            this.midmmrdelta = playerjson.midmmrdelta;
            this.botmmrdelta = playerjson.botmmrdelta;
            this.supportmmrdelta = playerjson.supportmmrdelta;
            this.primarymmrdelta = playerjson.primarymmrdelta;
            this.secondarymmrdelta = playerjson.secondarymmrdelta;
            this.fillmmrdelta = playerjson.fillmmrdelta;
            this.primaryrolepref = playerjson.primaryrolepref;
            this.secondaryrolepref = playerjson.secondaryrolepref;
            this.nevergetrole = playerjson.nevergetrole;
            this.history = playerjson.history;
            this.synergyrecord = playerjson.synergyrecord;
        }

        this.updateJSON();
        if (!initial) {
            bot.activeplayers[this.playerid] = this;
        }
    }

    updateJSON() {
        if (typeof this.bot.players[this.playerid] === 'undefined') {
            this.bot.players[this.playerid] = {
                playerid: this.playerid,
                discordid: this.discordid,
                tag: this.tag,
                name: this.name,
                mmr: this.mmr,
                wins: this.wins,
                losses: this.losses,
                winstreak: this.winstreak,
                lossstreak: this.lossstreak,
                topmmrdelta: this.topmmrdelta,
                junglemmrdelta: this.junglemmrdelta,
                midmmrdelta: this.midmmrdelta,
                botmmrdelta: this.botmmrdelta,
                supportmmrdelta: this.supportmmrdelta,
                primarymmrdelta: this.primarymmrdelta,
                secondarymmrdelta: this.secondarymmrdelta,
                fillmmrdelta: this.fillmmrdelta,
                primaryrolepref: this.primaryrolepref,
                secondaryrolepref: this.secondaryrolepref,
                nevergetrole: this.nevergetrole,
                history: this.history,
                synergyrecord: this.synergyrecord
            }
        } else {
            this.bot.players[this.playerid].playerid = this.playerid;
            this.bot.players[this.playerid].discordid = this.discordid;
            this.bot.players[this.playerid].tag = this.tag;
            this.bot.players[this.playerid].name = this.name;
            this.bot.players[this.playerid].mmr = this.mmr;
            this.bot.players[this.playerid].wins = this.wins;
            this.bot.players[this.playerid].losses = this.losses;
            this.bot.players[this.playerid].winstreak = this.winstreak;
            this.bot.players[this.playerid].lossstreak = this.lossstreak;
            this.bot.players[this.playerid].topmmrdelta = this.topmmrdelta;
            this.bot.players[this.playerid].junglemmrdelta = this.junglemmrdelta;
            this.bot.players[this.playerid].midmmrdelta = this.midmmrdelta;
            this.bot.players[this.playerid].botmmrdelta = this.botmmrdelta;
            this.bot.players[this.playerid].supportmmrdelta = this.supportmmrdelta;
            this.bot.players[this.playerid].primarymmrdelta = this.primarymmrdelta;
            this.bot.players[this.playerid].secondarymmrdelta = this.secondarymmrdelta;
            this.bot.players[this.playerid].fillmmrdelta = this.fillmmrdelta;
            this.bot.players[this.playerid].primaryrolepref = this.primaryrolepref;
            this.bot.players[this.playerid].secondaryrolepref = this.secondaryrolepref;
            this.bot.players[this.playerid].nevergetrole = this.nevergetrole;
            this.bot.players[this.playerid].history = this.history;
            this.bot.players[this.playerid].synergyrecord = this.synergyrecord;
        }
        fs.writeFile('./data/players.json', JSON.stringify(this.bot.players, null, 4), err => {
            if (err) throw err;
        });
    }

    getPlayerInfoEmbed() {
        let embed = new Discord.RichEmbed()
            .setColor("#9B59B6")
            .addField("Player Name", `${this.name}`)
            .addField("Player ID", `${this.playerid}`)
            .addField("MMR", `${this.mmr}`)
            .addField("Primary Role", `${this.primaryrolepref}`)
            .addField("Secondary Role", `${this.secondaryrolepref}`)
            .addField("Never Get Role", `${this.nevergetrole}`)
            .addField("Record", `Out of ${this.wins + this.losses} games played, ${this.wins} wins and ${this.losses} losses`)
            .addField("Position Specific MMR Delta", `Top: ${this.topmmrdelta}\nJungle: ${this.junglemmrdelta}\nMid: ${this.midmmrdelta}\nBot: ${this.midmmrdelta}\nSupport: ${this.supportmmrdelta}`)
            .addField("Preference Specific MMR Delta", `Primary: ${this.primarymmrdelta}\nSecondary: ${this.secondarymmrdelta}\nFill: ${this.fillmmrdelta}`);

        return embed;
    }

    getPlayerRoleEmbed() {
        let embed = new Discord.RichEmbed()
            .setAuthor(`${this.name}`)
            .setColor("#9B59B6")
            .addField("Primary Role", `${this.primaryrolepref}`)
            .addField("Secondary Role", `${this.secondaryrolepref}`)
            .addField("Never Get Role", `${this.nevergetrole}`);

        return embed;
    }

    getPlayerMMREmbed() {
        let embed = new Discord.RichEmbed()
            .setAuthor(`${this.name}`)
            .setColor("#9B59B6")
            .addField("MMR", `${this.mmr}`);

        return embed;
    }

    setPrimary(newRole) {
        switch (newRole) {
            case PRIMARY_ROLE.TOP:
                this.primaryrolepref = PRIMARY_ROLE.TOP;
                break;
            case PRIMARY_ROLE.JUNGLE:
                this.primaryrolepref = PRIMARY_ROLE.JUNGLE;
                break;
            case PRIMARY_ROLE.MID:
                this.primaryrolepref = PRIMARY_ROLE.MID;
                break;
            case PRIMARY_ROLE.BOT:
                this.primaryrolepref = PRIMARY_ROLE.BOT;
                break;
            case PRIMARY_ROLE.SUPPORT:
                this.primaryrolepref = PRIMARY_ROLE.SUPPORT;
                break;
            case PRIMARY_ROLE.FILL:
                this.primaryrolepref = PRIMARY_ROLE.FILL;
                break;
        }
        fs.writeFile('./data/players.json', JSON.stringify(this.bot.players, null, 4), err => {
            if (err) throw err;
            console.log(`${getTimeString()} Player "${this.name}" has set their Primary role to ${newRole}.`);
        });
    }

    setSecondary(newRole) {
        switch (newRole) {
            case SECONDARY_ROLE.TOP:
                this.secondaryrolepref = SECONDARY_ROLE.TOP;
                break;
            case SECONDARY_ROLE.JUNGLE:
                this.secondaryrolepref = SECONDARY_ROLE.JUNGLE;
                break;
            case SECONDARY_ROLE.MID:
                this.secondaryrolepref = SECONDARY_ROLE.MID;
                break;
            case SECONDARY_ROLE.BOT:
                this.secondaryrolepref = SECONDARY_ROLE.BOT;
                break;
            case SECONDARY_ROLE.SUPPORT:
                this.secondaryrolepref = SECONDARY_ROLE.SUPPORT;
                break;
            case SECONDARY_ROLE.FILL:
                this.secondaryrolepref = SECONDARY_ROLE.FILL;
                break;
            case SECONDARY_ROLE.NONE:
                this.secondaryrolepref = SECONDARY_ROLE.NONE;
                break;
        }
        fs.writeFile('./data/players.json', JSON.stringify(this.bot.players, null, 4), err => {
            if (err) throw err;
            console.log(`${getTimeString()} Player "${this.name}" has set their Secondary role to ${newRole}.`);
        });
    }

    setnevergetrole(newRole) {
        switch (newRole) {
            case NEVER_GET_ROLE.TOP:
                this.nevergetrole = NEVER_GET_ROLE.TOP;
                break;
            case NEVER_GET_ROLE.JUNGLE:
                this.nevergetrole = NEVER_GET_ROLE.JUNGLE;
                break;
            case NEVER_GET_ROLE.MID:
                this.nevergetrole = NEVER_GET_ROLE.MID;
                break;
            case NEVER_GET_ROLE.BOT:
                this.nevergetrole = NEVER_GET_ROLE.BOT;
                break;
            case NEVER_GET_ROLE.SUPPORT:
                this.nevergetrole = NEVER_GET_ROLE.SUPPORT;
                break;
            case NEVER_GET_ROLE.NONE:
                this.nevergetrole = NEVER_GET_ROLE.NONE;
                break;
        }
        fs.writeFile('./data/players.json', JSON.stringify(this.bot.players, null, 4), err => {
            if (err) throw err;
            console.log(`${getTimeString()} Player "${this.name}" has set their Never Get role to ${newRole}.`);
        });
    }

    setMMRNickname(member) {
        if (member.roles.find(r => r.name === "Registered")) {
            console.log(`${getTimeString()} Changing someone's nickname.`);
            let tempPlayer;
            if (this.bot.players.find((player) => {
                tempPlayer = player;
                return player.discordid === member.id;
            })) {
                member.setNickname(`[${tempPlayer.mmr}] ${tempPlayer.name}`);
            }
        }
    }

    getPlayerName() {
        return this.name;
    }

    setPlayerName(name) {
        this.name = name;
        this.updateJSON();
    }

    /**
     * @param {Number} newtopmmrdelta
     */
    settopmmrdelta(newtopmmrdelta) {
        this.topmmrdelta += newtopmmrdelta;
        this.bot.players[this.playerid].topmmrdelta += newtopmmrdelta;
    }

    /**
     * @param {Number} newjunglemmrdelta
     */
    setjunglemmrdelta(newjunglemmrdelta) {
        this.junglemmrdelta += newjunglemmrdelta;
        this.bot.players[this.playerid].junglemmrdelta += newjunglemmrdelta;
    }

    /**
     * @param {Number} newmidmmrdelta
     */
    setmidmmrdelta(newmidmmrdelta) {
        this.midmmrdelta += newmidmmrdelta;
        this.bot.players[this.playerid].midmmrdelta += newmidmmrdelta;
    }

    /**
     * @param {Number} newbotmmrdelta
     */
    setbotmmrdelta(newbotmmrdelta) {
        this.botmmrdelta += newbotmmrdelta;
        this.bot.players[this.playerid].botmmrdelta += newbotmmrdelta;
    }

    /**
     * @param {Number} newsupportmmrdelta
     */
    setsupportmmrdelta(newsupportmmrdelta) {
        this.supportmmrdelta += newsupportmmrdelta;
        this.bot.players[this.playerid].supportmmrdelta += newsupportmmrdelta;
    }

    /**
     * @param {Number} newprimarymmrdelta
     */
    setprimarymmrdelta(newprimarymmrdelta) {
        this.primarymmrdelta += newprimarymmrdelta;
        this.bot.players[this.playerid].primarymmrdelta += newprimarymmrdelta;
    }

    /**
     * @param {Number} newsecondarymmrdelta
     */
    setsecondarymmrdelta(newsecondarymmrdelta) {
        this.secondarymmrdelta += newsecondarymmrdelta;
        this.bot.players[this.playerid].secondarymmrdelta += newsecondarymmrdelta;
    }

    /**
     * @param {Number} newfillmmrdelta
     */
    setfillmmrdelta(newfillmmrdelta) {
        this.fillmmrdelta += newfillmmrdelta;
        this.bot.players[this.playerid].fillmmrdelta += newfillmmrdelta;
    }

    /**
     * @param {Number} gameNumber
     */
    setHistory(gameNumber) {
        this.history.push(gameNumber);
    }

    /**
     * @param {Number} delta
     */
    applyMMR(delta) {
        this.mmr += delta;
        this.bot.players[this.playerid].mmr += delta;
        
        let tempMember;
        this.bot.guilds.find((guild) => {
            return guild.members.find((member) => {
                tempMember = member;
                return member.id === this.discordid;
            });
        });
        this.setMMRNickname(tempMember);
    }

    /**
     * @param {Number} teammateid 
     * @param {Boolean} won
     */
    setSynergyRecord(teammateid, won) {
        if (this.synergyrecord[teammateid] === null || typeof this.synergyrecord[teammateid] === 'undefined') {
            console.log(`${getTimeString()} Player: ${this.playerid} with teammate: ${teammateid} have a new synergy record created.`);
            this.synergyrecord[teammateid] = {
                playerid: teammateid,
                wins: 0,
                losses: 0
            }
        }
        if (won) {
            //console.log(`${getTimeString()} Player: ${this.playerid} with teammate: ${teammateid} have added a win to their synergy record.`);
            this.synergyrecord[teammateid].wins++;
        } else {
            //console.log(`${getTimeString()} Player: ${this.playerid} with teammate: ${teammateid} have added a loss to their synergy record.`);
            this.synergyrecord[teammateid].losses++;
        }
    }

    addWinStreak() {
        this.wins++;
        this.winstreak++;
        this.lossstreak = 0;
    }

    addLossStreak() {
        this.losses;
        this.lossstreak++;
        this.winstreak = 0;
    }


    isPrimary(position) {
        if (this.primaryrolepref === PRIMARY_ROLE.FILL) {
            return true;
        }
        switch (position) {
            case 0:
                return this.primaryrolepref === PRIMARY_ROLE.TOP;
            case 1:
                return this.primaryrolepref === PRIMARY_ROLE.JUNGLE;
            case 2:
                return this.primaryrolepref === PRIMARY_ROLE.MID;
            case 3:
                return this.primaryrolepref === PRIMARY_ROLE.BOT;
            case 4:
                return this.primaryrolepref === PRIMARY_ROLE.SUPPORT;
        }
    }

    isSecondary(position) {
        if (this.secondaryrolepref === SECONDARY_ROLE.FILL) {
            return true;
        }
        switch (position) {
            case 0:
                return this.secondaryrolepref === SECONDARY_ROLE.TOP;
            case 1:
                return this.secondaryrolepref === SECONDARY_ROLE.JUNGLE;
            case 2:
                return this.secondaryrolepref === SECONDARY_ROLE.MID;
            case 3:
                return this.secondaryrolepref === SECONDARY_ROLE.BOT;
            case 4:
                return this.secondaryrolepref === SECONDARY_ROLE.SUPPORT;
        }
    }

    isFill(position) {
        return !this.isPrimary(position) && !this.isSecondary(position);
    }

    isNeverGet(position) {
        switch (position) {
            case 0:
                return this.nevergetrole === NEVER_GET_ROLE.TOP;
            case 1:
                return this.nevergetrole === NEVER_GET_ROLE.JUNGLE;
            case 2:
                return this.nevergetrole === NEVER_GET_ROLE.MID;
            case 3:
                return this.nevergetrole === NEVER_GET_ROLE.BOT;
            case 4:
                return this.nevergetrole === NEVER_GET_ROLE.SUPPORT;
        }
    }

    getPlayerSynergy(teammate) {
        if (this.synergyrecord[teammate.playerid] != null) {
            let totalPlayerGames = this.wins + this.losses;
            let totalTeammateGames = teammate.wins + teammate.losses;
            if (totalTeammateGames === 0 || totalPlayerGames === 0) {
                return 0.5;
            }
            let playerModifier = totalPlayerGames;
            if (playerModifier > 25) {
                playerModifier = 25;
            }
            // playerModifier = 15, teammate.wins = 3, totalTeammateGames = 6
            // ((25 - 15) * 0.02) + (15 * 0.02 * 2 * 3 / 6) = 0.5 (original wr = 0.5)
            // playerModifier = 15, teammate.wins = 3, totalTeammateGames = 9
            // ((25 - 15) * 0.02) + (15 * 0.02 * 2 * 3 / 9) = 0.4 (original wr = 0.33)
            // playerModifier = 4, teammate.wins = 1, totalTeammateGames = 3
            // ((25 - 4) * 0.02) + (4 * 0.02 * 2 * 1 / 3) = 0.4733 (original wr = 0.36)
            // playerModifier = 25, teammate.wins = 500, totalTeammateGames = 800
            // ((25 - 25) * 0.02) + (25 * 0.02 * 2 * 500 / 800) = 0.625 (original wr = 0.625)
            return ((25 - playerModifier) * 0.02) + (playerModifier * 0.02 * 2 * teammate.wins / totalTeammateGames);
        }
        return 0.5;
    }
}

module.exports = Player;