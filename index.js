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
    if (message.author.id === client.user.id){
        lastActivityTimestamp = Date.now();
        if (client.user.presence.status !== 'dnd') {
            client.user.setPresence({ status: 'dnd' });
            console.log('Status auf "dnd" gesetzt wegen neuer Aktivität.');
        }
    }

    if (message.author.id === client.user.id && message.content !== '!infotest') return;
    if (message.guild && message.content !== '!infotest') return;

    if (message.content === '!info' || message.content === '!infotest' && message.author.id === client.user.id) {
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

client.login(token);
