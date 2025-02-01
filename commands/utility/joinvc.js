const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('joinvc')
        .setDescription('Joins the users current voice channel'),
    async execute(interaction) {
        try {
            const member = interaction.member;
            const channel = member.voice.channel;
            
            if (!channel) {
                return interaction.reply({ content: 'You must be in a voice channel!', ephemeral: true });
            }
            
            joinVoiceChannel({
                channelId: channel.id,
                guildId: interaction.guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator,
                selfDeaf: false,
            });
            
            await interaction.reply({ content: `Joined ${channel.name}.`, ephemeral: false });

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
        }
    },
};