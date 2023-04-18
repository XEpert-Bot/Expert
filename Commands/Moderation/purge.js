const {
  SlashCommandBuilder,
  Permissions,
  PermissionsBitField,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Clear messages")
    .setDMPermission(false)
    .addStringOption((option) =>
      option
        .setName("amount")
        .setDescription("The number of messages to clear")
        .setRequired(true)
    )
    .addUserOption((option) =>
      option.setName("user").setDescription("Clear messages of a specific user")
    ),
  async execute(interaction) {
    // get amout and user optios from interaction
    const amount = interaction.options.getString("amount");
    const user = interaction.options.getUser("user");

    // check if user has perms to mannage messages
    if (
      !interaction.member.permissions.has(PermissionsBitField.ManageMessages)
    ) {
      return interaction.reply({
        content: "You do not have permission to use this command.",
        ephemeral: true,
      });
    }
    // check if the amout is a valid # greater than 0
    if (isNaN(amount) || parseInt(amount) < 1) {
      return interaction.reply({
        content: "Please provide a valid number greater than 0.",
        ephemeral: true,
      });
    }
    // defer the reply to reduce API overhead
    await interaction.deferReply({ ephemeral: true });

    // # of messages that have been deleted so far
    let deletedSize = 0;

    // if the user specified a user to clear messages from
    if (user) {
      let fetchedMessages;
      let lastMessageId = null;

      // keep fetching messages until there are no more message to delete
      do {
        fetchedMessages = await interaction.channel.messages.fetch({
          limit: 100, // batches of 100
          before: lastMessageId, // fetch msgs
        });

        // filter to only those spent by specified user
        const messagesToDelete = fetchedMessages.filter(
          (m) => m.author.id === user.id
        );
        // # of messages to delete in the current batch
        const messagesToDeleteSize = messagesToDelete.size;

        // if there are messages to delete, delete them and add to the total deleted size
        if (messagesToDeleteSize > 0) {
          const deletedMessages = await interaction.channel.bulkDelete(
            messagesToDelete,
            true // deleting messages permanently from the channel
          );
          deletedSize += deletedMessages.size;
        }

        lastMessageId = fetchedMessages.last()?.id; // setting the ID of the last message in the batch
      } while (fetchedMessages.size === 100); // keep fetching messages until there are no more messages left to fetch

      // if the user specified a number of messages to delete
    } else {
      // keep deleting messages until the desired number of messages have been deleted
      while (deletedSize < amount) {
        const remainingAmount = amount - deletedSize; // the number of remaining messages to delete
        const batchSize = remainingAmount > 100 ? 100 : remainingAmount; //deleting messages in batches of 100 or less, depending on the number of remaining messages

        const fetchedMessages = await interaction.channel.messages.fetch({
          limit: batchSize, // fetching messages in batches
        });
        const deletedMessages = await interaction.channel.bulkDelete(
          fetchedMessages,
          true // deleting messages permanently from the channel
        );

        // if there are messages deleted, update the deletedSize
        if (deletedMessages.size > 0) {
          deletedSize += deletedMessages.size;
        } else {
          // if no messages are deleted, stop the loop
          break;
        }
      }
    }

    const deletedUser = user ? user.username : "everyone";

    return interaction.followUp({
      content: `Successfully deleted **${deletedSize}** messages sent by ${deletedUser}.`,
    });
  },
};
