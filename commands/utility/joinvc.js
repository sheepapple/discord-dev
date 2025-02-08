const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('joinvc')
        .setDescription('Joins the voice channel you are currently in'),
    
    async execute(interaction) {
        // Fetch fresh member data
        const member = await interaction.guild.members.fetch(interaction.user.id);
        const voiceChannel = member.voice.channel;

        if (!voiceChannel) {
            return interaction.reply({ content: "You need to be in a voice channel for me to join!", ephemeral: true });
        }

        // If the bot is already connected somewhere, destroy that connection first
        const existingConnection = getVoiceConnection(interaction.guild.id);
        if (existingConnection) {
            existingConnection.destroy();
        }

        try {
            joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator,
                selfDeaf: false,
            });

            return interaction.reply({ content: `Joined ${voiceChannel.name}!`, ephemeral: true });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: "Failed to join the voice channel.", ephemeral: true });
        }
    }
};
