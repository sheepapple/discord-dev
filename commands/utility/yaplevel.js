const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection, EndBehaviorType } = require('@discordjs/voice');
const prism = require('prism-media');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('yaplevel')
    .setDescription('Joins your VC and gauges the current yap level'),
  
  async execute(interaction) {
    // Fetch fresh member data to ensure the latest voice state.
    const member = await interaction.guild.members.fetch(interaction.user.id);
    const voiceChannel = member.voice.channel;
    
    if (!voiceChannel) {
      return interaction.reply({ content: 'You need to be in a voice channel!', ephemeral: true });
    }
    
    // Disconnect any existing connection.
    const existingConnection = getVoiceConnection(interaction.guild.id);
    if (existingConnection) existingConnection.destroy();
    
    // Join the voice channel.
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      selfDeaf: false,
    });
    
    // Listen for users starting to speak.
    connection.receiver.speaking.on('start', userId => {
      console.log(`User ${userId} started speaking.`);
      
      // Subscribe to the user's Opus audio stream.
      const opusStream = connection.receiver.subscribe(userId, {
        end: {
          behavior: EndBehaviorType.AfterSilence,
          duration: 1000,
        },
      });
      
      // Create an Opus decoder to convert to PCM.
      // Discord uses 48000Hz, 2 channels by default; adjust frameSize if necessary.
      const decoder = new prism.opus.Decoder({ rate: 48000, channels: 2, frameSize: 960 });
      
      const pcmChunks = [];
      // Pipe the opus stream through the decoder.
      const pcmStream = opusStream.pipe(decoder);
      
      pcmStream.on('data', chunk => {
        pcmChunks.push(chunk);
      });
      
      pcmStream.on('end', () => {
        // Concatenate the PCM chunks.
        const pcmBuffer = Buffer.concat(pcmChunks);
        // Compute the volume as RMS.
        const rms = computeRMS(pcmBuffer);
        // Optionally convert RMS to decibels (dB). Adjust the reference value as needed.
        const dB = 20 * Math.log10(rms || 1e-10); // Avoid log(0)
        console.log(`User ${userId} RMS: ${rms.toFixed(2)} (approx. ${dB.toFixed(2)} dB)`);
      });
      
      pcmStream.on('error', error => {
        console.error(`Error processing audio for user ${userId}:`, error);
      });
    });
    
    return interaction.reply({ content: `Joined ${voiceChannel.name} and now listening for volume changes. Check your console for volume data.`, ephemeral: true });
  }
};

/**
 * Computes the RMS (root mean square) for a buffer containing 16-bit PCM samples.
 * Note: Each sample is assumed to be 2 bytes (16-bit little-endian). If you have stereo audio,
 *       samples will alternate between channels.
 *
 * @param {Buffer} buffer - PCM audio data.
 * @returns {number} - The RMS value.
 */
function computeRMS(buffer) {
  let sum = 0;
  let sampleCount = 0;
  
  // Process only complete samples.
  for (let i = 0; i < buffer.length - 1; i += 2) {
    // Read the 16-bit signed sample.
    const sample = buffer.readInt16LE(i);
    sum += sample * sample;
    sampleCount++;
  }
  
  if (sampleCount === 0) return 0;
  return Math.sqrt(sum / sampleCount);
}
