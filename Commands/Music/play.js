const { ButtonBuilder, ActionRowBuilder, EmbedBuilder, SlashCommandBuilder, ButtonStyle } = require("discord.js");
const client = require("../../index");

module.exports = {
  premiumOnly: false,
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a song.")
    .addStringOption(option =>
      option.setName("query")
        .setDescription("Provide the name or url for the song.")
        .setRequired(true)
    ),
  async execute(interaction) {
    const { options, member, guild, channel } = interaction;

    const query = options.getString("query");
    const voiceChannel = member.voice.channel;

    const embed = new EmbedBuilder();

    if (!voiceChannel) {
      embed.setColor("#ff0000").setDescription("You must be in a voice channel to execute music commands.");
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (!member.voice.channelId == guild.members.me.voice.channelId) {
      embed.setColor("#ff0000").setDescription(`You can't use the music player as it is already active in <#${guild.members.me.voice.channelId}>`);
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    try {

      client.distube.play(voiceChannel, query, { textChannel: channel, member: member });

      const pauseButton = new ButtonBuilder()
        .setCustomId("pause")
        .setLabel("Pause")
        .setStyle(ButtonStyle.Secondary);


      const resumeButton = new ButtonBuilder()
        .setCustomId("resume")
        .setLabel("Resume")
        .setStyle(ButtonStyle.Secondary);

      const skipButton = new ButtonBuilder()
        .setCustomId("skip")
        .setLabel("Skip")
        .setStyle(ButtonStyle.Danger);

      const row = new ActionRowBuilder()
        .addComponents(pauseButton, resumeButton, skipButton);

      const message = await interaction.reply({
        content: "🎶 Request received.",
        components: [row]
      });

      // Add a listener for button interactions
      const filter = (i) => ["pause", "resume", "skip"].includes(i.customId) && i.user.id === interaction.user.id;
      const collector = message.createMessageComponentCollector({ filter, time: 1500000 });

      collector.on("collect", async (i) => {
        if (i.customId === "pause") {
          client.distube.pause(guild);
          await i.update({ content: "⏸ Music paused.", components: [row] });
        } else if (i.customId === "resume") {
          client.distube.resume(guild);
          await i.update({ content: "▶️ Music resumed.", components: [row] });
        } else if (i.customId === "skip") {
          client.distube.skip(guild);
          await i.update({ content: "⏭️ Song skipped.", components: [row] });
        }
      });

      collector.on("end", () => {
        // Remove the buttons after the collector expires
        message.edit({ components: [] });
      });

    } catch (err) {
      console.log(err);

      embed.setColor("#ff0000").setDescription("⛔ | Something went wrong...");

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
}
