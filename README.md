# InHousePUGBot README

This is a Discord Bot using Node.js & Discord.js (11.6.4)


## What's Missing

 - "data" Folder containing 2 files
 - - "lobbies.json" File containing a list of all game lobbies (Potentially changed in the future)
 - - "players.json" File containing a list of all registered players
 - "token.json" File containing the unique discord bot token


### Discord Commands

Each command must be proceeded by the discord bot's prefix

#### playerinfo <@user>

Usability: Everyone

Description: Displays player information of the user mentioned in the message. If no user is mentioned the player information of the author of the message is displayed.

#### ping

Usability: Everyone

Description: Replies "pong" to the author.

#### register <In Game Name>

Usability: Everyone

Description: Registers the author of the message as a player if they aren't already. Then assigns their player name to the argument (works even if the author is already registered).

#### join

Usability: Registered

Description: If the text channel is a lobby and the player is not already in the queue, the player will be inserted into the queue. If the player is the 10th player to join the queue, a game will be created. This command also removes the previous 4 messages in the channel (including the author's message).

#### leave

Usability: Registered

Description: If the text channel is a lobby and the player is already in the queue, then the player will be removed from the queue. This command also removes the previous 4 messages in the channel (including the author's message).

#### setprimary <role>

Usability: Registered

Description: If the author is a registered player and the role argument is valid (top, jungle, mid, bot, support, or fill), then the player's primary role will be assigned to the role argument.

#### setsecondary <role>

Usability: Registered

Description: If the author is a registered player and the role argument is valid (top, jungle, mid, bot, support, or fill), the the player's secondary role will be assigned to the role argument.

#### setneverget <role>

Usability: Registered

Description: If the author is a registered player and the role argument is valid (top, jungle, mid, bot, support, or none), then the player's never get role will be assigned to the role argument.

#### result <#lobby channel> <game number> <winning team>

Usability: Moderator/Administrator

Description: If the game is valid and has not been decided yet, the game's outcome will be recorded and MMR points will be awarded accordingly and will notify each user's change in MMR points.

#### teamtest

Usability: Administrator

Description: Creates 10 randomized players and then creates a game with those 10 players (used to test some features of the bot).


### Match Selection



#### Match Selection TLDR



### MMR Point Rewards



#### MMR Point Rewards TLDR



