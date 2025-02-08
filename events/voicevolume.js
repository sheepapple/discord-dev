// events/voiceVolume.js
const { EndBehaviorType, getVoiceConnection } = require('@discordjs/voice');
const prism = require('prism-media');
const io = require('../server'); // Import Socket.IO from your Express server

module.exports = {
    name: 'voiceStateUpdate',
    once: false, // Runs every time a user starts/stops speaking
    async execute(oldState, newState) {
        const voiceChannel = newState.channel;

        if (!voiceChannel || oldState.channel === newState.channel) return; // Ignore if no change

        console.log(`User ${newState.id} joined voice channel ${voiceChannel.name}`);

        const connection = getVoiceConnection(voiceChannel.guild.id);
        if (!connection) return; // Bot must be connected to process audio

        connection.receiver.speaking.on('start', (userId) => {
            console.log(`User ${userId} started speaking.`);

            const opusStream = connection.receiver.subscribe(userId, {
                end: { behavior: EndBehaviorType.AfterSilence, duration: 1000 },
            });

            const decoder = new prism.opus.Decoder({ rate: 48000, channels: 2, frameSize: 960 });
            const pcmChunks = [];
            const pcmStream = opusStream.pipe(decoder);

            pcmStream.on('data', (chunk) => {
                pcmChunks.push(chunk);
            });

            pcmStream.on('end', () => {
                const pcmBuffer = Buffer.concat(pcmChunks);
                const rms = computeRMS(pcmBuffer);
                const db = 20 * Math.log10(rms || 1e-10);
                io.emit('volumeUpdate', db); // Send data to the gauge
                console.log(`User ${userId} volume: ${db.toFixed(2)} dB`);
            });
        });
    }
};

function computeRMS(buffer) {
    let sum = 0, sampleCount = 0;
    for (let i = 0; i < buffer.length - 1; i += 2) {
        const sample = buffer.readInt16LE(i);
        sum += sample * sample;
        sampleCount++;
    }
    return sampleCount === 0 ? 0 : Math.sqrt(sum / sampleCount);
}