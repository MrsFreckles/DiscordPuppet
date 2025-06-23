const { GoogleGenAI } = require("@google/genai");
const { Client } = require('discord.js-selfbot-v13');
const { createCanvas, loadImage } = require('canvas');
const { GIFEncoder, quantize, applyPalette } = require('gifenc');
const { request } = require('undici');
const fs = require('fs');
const path = require('path');
const propertiesContent = fs.readFileSync('config.properties', 'utf8');

const client = new Client();

const FRAMES = 10;
const DELAY = 20;
const RESOLUTION = 128;

const infoText = `﹉﹉﹉﹉﹉୨♡୧﹉﹉﹉﹉﹉
ღ┇name: Luna
ღ┇gender: Female
ღ┇born: <t:1178748000:R> 
ღ┇sexuality: <:lesbian:1359250397906337915> <:sapphic:1359250399911219251>
ღ┇songs: changes alot.. currently: [Girl of my Dreams - Guti](<https://www.youtube.com/watch?v=j80HSX6l9gM>), [DOING IT AGAIN BABY - girl in red](<https://www.youtube.com/watch?v=FrnYzWo75OY>)
ღ┇games: Minecraft, Assetto Corsa, Fh4, Fh5, Muse Dash, ...
⌣⌣⌣⌣⌣⌣⌣⌣⌣⌣⌣⌣⌣⌣
╰─ ୨୧ interests & more!
ღ┇likes: cars & bikes, skating, programming, gaming, music, reading (yuri especially), streaming, video essays, video editing (I have too many hobbies I know)
ღ┇location: Germany 🥨 🍺 
⌣⌣⌣⌣⌣⌣⌣⌣⌣⌣⌣`;


// Pfade zu den petpet-Frames (müssen im Projektverzeichnis liegen)
const framePaths = Array.from({ length: FRAMES }, (_, i) =>
    path.join(__dirname, `frames/pet${i}.gif`)
);

// Properties parsen
const config = {};
propertiesContent.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        config[key.trim()] = valueParts.join('=').trim();
    }
});

// Token auslesen
const token = config['token'];
const apiKey = config['gemini'].toString();
const ai = new GoogleGenAI({apiKey});
async function generatePetPetGIF(avatarUrl) {
    const avatar = await loadImage(avatarUrl);
    const gif = GIFEncoder();

    const canvas = createCanvas(RESOLUTION, RESOLUTION);
    const ctx = canvas.getContext('2d');

    const frames = await Promise.all(framePaths.map(p => loadImage(p)));

    for (let i = 0; i < FRAMES; i++) {
        ctx.clearRect(0, 0, RESOLUTION, RESOLUTION);

        const j = i < FRAMES / 2 ? i : FRAMES - i;
        const width = 0.8 + j * 0.02;
        const height = 0.8 - j * 0.05;
        const offsetX = (1 - width) * 0.5 + 0.1;
        const offsetY = 1 - height - 0.08;

        ctx.drawImage(
            avatar,
            offsetX * RESOLUTION,
            offsetY * RESOLUTION,
            width * RESOLUTION,
            height * RESOLUTION
        );
        ctx.drawImage(frames[i], 0, 0, RESOLUTION, RESOLUTION);

        const { data } = ctx.getImageData(0, 0, RESOLUTION, RESOLUTION);
        const palette = quantize(data, 256);
        const index = applyPalette(data, palette);

        gif.writeFrame(index, RESOLUTION, RESOLUTION, {
            transparent: true,
            palette,
            delay: DELAY,
        });
    }

    gif.finish();

    return Buffer.from(gif.bytes());
}

client.on('ready', () => {
    console.log(`${client.user.username} verstößt nun gegen die Terms of Service von Discord!`);
});

let lastActivityTimestamp = Date.now();

function updateStatusIfNeeded() {
    const now = Date.now();
    const diff = now - lastActivityTimestamp;

    if (diff >= 5 * 60 * 1000 && client.user.presence.status !== 'idle') {
        client.user.setPresence({ status: 'idle' });
        console.log('Status auf "abwesend" gesetzt wegen Inaktivität.');
    }
}

// Alle 10 Sekunden prüfen, ob 5 Minuten Inaktivität vergangen sind
setInterval(updateStatusIfNeeded, 10 * 1000);

client.on('messageCreate', async message => {
    if (message.content.includes('nvm') && !message.content.includes('https://github.com/nvm-sh/nvm') && (message.author.id === client.user.id || !message.guild || message.guild.ownerId === client.user.id)) {
        await message.channel.send('https://github.com/nvm-sh/nvm');
        return;
    }

    if (message.author.id === client.user.id && message.content.startsWith('&ai')) {

        function splitMessage(text, maxLen = 2000) {
            const chunks = [];
            let start = 0;
            while (start < text.length) {
                chunks.push(text.slice(start, start + maxLen));
                start += maxLen;
            }
            return chunks;
        }

        if(message.content.startsWith('&aie')) {
            const prompt = message.content.slice(4).trim();
            message = replaceMessageContents(message);

            try {
                const response = await ai.models.generateContent({
                    model: "gemini-2.0-flash",
                    contents: [
                        {
                            role: "user",
                            parts: [{
                                text: `Return this exact message, with no changes to spelling, words, or things like that. Don't return anything else either. The only thing you are supposed to do is to analyse the message and return it with added text faces (example: (づ｡◕‿‿◕｡)づ), that fit the message.

Message: ${prompt}`
                            }]
                        }
                    ]
                });


                var output = response.text;
                output = replaceMessageContents(output);
                const parts = splitMessage(output, 2000);

                // Erster Chunk ersetzt den &ai-Prompt in deiner eigenen Nachricht
                await message.edit(parts[0]);

                // Alle weiteren Chunks normal versenden
                for (let i = 1; i < parts.length; i++) {
                    await message.channel.send(parts[i]);
                }
            } catch (err) {
                console.error('Fehler beim Aufruf von Gemini:', err);
                await message.channel.send('An error occured. Please try again later :3');
            }
        } else {
            const prompt = message.content.slice(3).trim();
            message = replaceMessageContents(message);

            try {
                const response = await ai.models.generateContent({
                    model: "gemini-2.0-flash",
                    contents: prompt
                });
                var output = response.text;
                output = replaceMessageContents(output);
                const parts = splitMessage(output, 2000);

                // Erster Chunk ersetzt den &ai-Prompt in deiner eigenen Nachricht
                await message.edit(parts[0] + "\n-# AI generated response");

                // Alle weiteren Chunks normal versenden
                for (let i = 1; i < parts.length; i++) {
                    await message.channel.send(parts[i]);
                }
            } catch (err) {
                console.error('Fehler beim Aufruf von Gemini:', err);
                await message.channel.send('An error occured. Please try again later :3');
            }
        }
    }






    if (message.author.id === client.user.id){
        lastActivityTimestamp = Date.now();
        if (client.user.presence.status !== 'online') {
            client.user.setPresence({ status: 'online' });
            console.log('Status auf "dnd" gesetzt wegen neuer Aktivität.');
        }
    }

    if (message.author.id === client.user.id && message.content !== '&info') return;
    if (message.guild && message.content !== '&info') return;

    if (message.content === '!info' || message.content === '&info' && message.author.id === client.user.id) {
        await message.channel.send(infoText);

        try {
            const avatarURL = message.author.displayAvatarURL({ format: 'png', size: 256 });
            const gifBuffer = await generatePetPetGIF(avatarURL);

            await message.channel.send({
                files: [{
                    attachment: gifBuffer,
                    name: 'petpet.gif'
                }]
            });
        } catch (err) {
            console.error('Fehler beim Generieren des petpet-GIFs:', err);
            await message.channel.send('Konnte kein petpet erstellen 😿');
        }
    }
});

function replaceMessageContents(param){
    param.toString().replace('\\', '\\\\');
    param.toString().replace('\"', '\\"');
    param.toString().replace('/', '\/');
    param.toString().replace('\\b', '\\\\b');
    param.toString().replace('\\f', '\\\\f');
    param.toString().replace('\\n', '\\\\n');
    param.toString().replace('\\r', '\\\\r');
    param.toString().replace('\\t', '\\\\t');
    param.toString().replace('`', '\`');
    return param;
}

client.login(token);