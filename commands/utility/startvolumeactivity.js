// commands/startVolumeActivity.js
const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('startvolumeactivity')
        .setDescription('Starts the voice volume gauge activity in your voice channel'),
    async execute(interaction) {
        const member = await interaction.guild.members.fetch(interaction.user.id);
        const voiceChannel = member.voice.channel;

        if (!voiceChannel) {
            return interaction.reply('You must be in a voice channel to start the activity!');
        }

        joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator,
            selfDeaf: false,
        });

        interaction.reply('Volume activity started! Open [https://gauge.sheepapple.net](https://gauge.sheepapple.net) to view the gauge.');
    },
};
