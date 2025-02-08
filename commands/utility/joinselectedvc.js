const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, Events } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('joinselectedvc')
        .setDescription('Select a voice channel for the bot to join'),
    
    async execute(interaction) {
        const guild = interaction.guild;
        const voiceChannels = guild.channels.cache.filter(channel => channel.type === 2); // Type 2 = Voice Channel
        
        if (!voiceChannels.size) {
            return interaction.reply({ content: 'No available voice channels found.', ephemeral: true });
        }

        const options = voiceChannels.map(channel => ({
            label: channel.name,
            value: channel.id
        }));

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('voice_channel_select')
            .setPlaceholder('Select a voice channel')
            .addOptions(options);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await interaction.reply({ content: 'Select a voice channel for me to join:', components: [row], ephemeral: true });
    }
};

module.exports.interactionHandler = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isStringSelectMenu()) return;

        if (interaction.customId === 'voice_channel_select') {
            const channelId = interaction.values[0];
            const channel = interaction.guild.channels.cache.get(channelId);
            const member = interaction.guild.members.cache.get(interaction.user.id);

            if (!member.voice.channel) {
                return interaction.reply({ content: "You need to be in a voice channel to use this command!", ephemeral: true });
            }

            if (!channel || channel.type !== 2) {
                return interaction.reply({ content: "Invalid voice channel selection.", ephemeral: true });
            }

            try {
                const connection = joinVoiceChannel({
                    channelId: channel.id,
                    guildId: channel.guild.id,
                    adapterCreator: channel.guild.voiceAdapterCreator,
                    selfDeaf: false,
                });

                return interaction.reply({ content: `Joined ${channel.name}!`, ephemeral: true });
            } catch (error) {
                console.error(error);
                return interaction.reply({ content: "Failed to join the voice channel.", ephemeral: true });
            }
        }
    }
};