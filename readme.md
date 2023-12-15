# Discord Leveling Bot

This Discord bot provides a leveling system for server members, rewarding them with roles and displaying leaderboards based on their activity in text channels.

## Features

- **XP System:** Users earn XP for sending messages in the server.
- **Level Up Notifications:** Sends a custom message when users level up.
- **Role Assignments:** Assigns roles based on the user's level.
- **XP Leaderboard:** Displays a leaderboard of the top users by XP.
- **Rank Command:** Shows a user's current rank, level, and XP.
- **XP Management Commands:** Includes commands for viewing and managing user XP.

## Installation

Before installing, ensure you have Node.js and npm installed on your system.

1. Clone the repository:
   ```
   git clone https://github.com/wickstudio/leveling-discord-bot.git
   ```
2. Navigate to the bot's directory and install dependencies:
   ```
   install.bat
   ```

## Configuration

1. Create a `config.json` file in the bot directory with the following structure:
   ```json
   {
     "token": "YOUR_BOT_TOKEN",
     "levelUpChannelId": "CHANNEL_ID_FOR_LEVEL_UP_MESSAGES",
     "levelRoles": {
       "1": "ROLE_ID_FOR_LEVEL_1",
       "2": "ROLE_ID_FOR_LEVEL_2",
     }
   }
   ```
2. Replace `YOUR_BOT_TOKEN` with your Discord bot token.
3. Set the `levelUpChannelId` to the ID of the channel where level-up messages should be sent.
4. Configure `levelRoles` with the corresponding role IDs for each level.

## Usage

To start the bot, run:
```
start.bat
```

## Commands

- `!xp`: Displays the XP leaderboard.
- `!rank`: Shows the user's current rank, level, and XP.
- `!clear <userId>`: Resets the XP and level for a specified user ID (Administrator only).

## Contributing

Contributions, issues, and feature requests are welcome. Feel free to check [issues page]([link-to-your-issues-page](https://github.com/wickstudio/leveling-discord-bot/issues)) if you want to contribute. or join [Discord Server](https://discord.gg/wicks)

## License
Distributed under the MIT License. See `LICENSE` for more information.

## Contact

- Email : wick@wick-studio.com

- Website : https://wickdev.xyz

- Discord : https://discord.gg/wicks

- Youtube : https://www.youtube.com/@wick_studio
