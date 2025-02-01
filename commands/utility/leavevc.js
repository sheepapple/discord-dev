const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leavevc')
        .setDescription('Makes the bot leave the voice channel'),
    async execute(interaction) {
        const connection = getVoiceConnection(interaction.guild.id);
        
        if (!connection) {
            return interaction.reply({ content: 'I am not connected to any voice channel.', ephemeral: true });
        }
        
        connection.destroy();
        interaction.reply({ content: 'Left the voice channel.', ephemeral: false });
    },
};