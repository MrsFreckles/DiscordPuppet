# Discord Selfbot with PetPet GIF Generator

This project is a **Discord selfbot** that includes a feature to generate animated "petpet" GIFs from user avatars. It also provides an informational command and manages user presence based on activity.

## Features

- **PetPet GIF Generator**: Generates a "petpet" GIF from the user's avatar.
- **Info Command**: Displays a predefined information text.
- **Activity-Based Presence**: Automatically updates the bot's presence based on user activity.

## Requirements

- Node.js (v16 or higher)
- npm (Node Package Manager)
- Discord.js-Selfbot-V13
- Additional dependencies: `canvas`, `gifenc`, `undici`, `fs`, `path`

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/MrsFreckles/DiscordPuppet.git
   cd .../DiscordPuppet/
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Add your configuration:
   - Create a `config.properties` file in the root directory.
   - Add your Discord token:
     ```ini
     token = YOUR_DISCORD_TOKEN
     ```

4. Ensure the `frames` directory contains the required petpet GIF frames (`pet0.gif`, `pet1.gif`, etc.).

### WARNING! Doing this is against Discords terms of service and might therefore result in a ban!

## Usage

1. Start the selfbot:
   ```bash
   node index.js
   ```

2. Use the following commands in Discord:
   - `!info`: Displays the information text and generates a petpet GIF.
   - `!infotest`: Displays the information text and generates a petpet GIF. (Can be called everywhere, but only by the account the selfbot is running on)

## Notes

- **Terms of Service**: Using selfbots is against Discord's Terms of Service. Use this project at your own risk.
- Ensure the `config.properties` file is listed in `.gitignore` to avoid exposing your token.

## Dependencies

- [discord.js-selfbot-v13](https://github.com/aiko-chan-ai/discord.js-selfbot-v13)
- [canvas](https://github.com/Automattic/node-canvas)
- [gifenc](https://github.com/mattdesl/gifenc)
- [undici](https://github.com/nodejs/undici)

## License

This project is for educational purposes only and is not intended for production use.
