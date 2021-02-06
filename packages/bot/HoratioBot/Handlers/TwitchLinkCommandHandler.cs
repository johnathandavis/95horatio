// -----------------------------------------------------------------------
// <copyright file="TwitchLinkCommandHandler.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Handlers
{
    using System;
    using System.Linq;
    using System.Threading.Tasks;
    using Discord;
    using Discord.WebSocket;
    using HoratioBot.Clients;
    using HoratioBot.Storage;
    using Microsoft.Extensions.Logging;

    /// <summary>
    /// A TwitchLinkCommandHandler class.
    /// </summary>
    public class TwitchLinkCommandHandler : ITwitchCommandHandler, IDiscordCommandHandler
    {
        private readonly ILinkRequestsStorageManager linkRequestsStorage;
        private readonly DiscordSocketClient discordSocketClient;
        private readonly IUsersClient usersClient;
        private readonly ILogger<TwitchLinkCommandHandler> logger;

        public TwitchLinkCommandHandler(
            ILinkRequestsStorageManager linkRequestsStorage,
            IUsersClient usersClient,
            DiscordSocketClient client,
            ILogger<TwitchLinkCommandHandler> logger)
        {
            this.linkRequestsStorage = linkRequestsStorage;
            this.usersClient = usersClient;
            this.discordSocketClient = client;
            this.logger = logger;
        }

        public async Task RunCommandAsync(ChatBot.MessageEventArgs message)
        {
            var messageParts = message.Message.Split(' ');
            if (messageParts.Length != 2)
            {
                message.Reply($"Command is {CommandName} DiscordUsername (include #1234 discriminator)");
                return;
            }

            string recipient = messageParts[1];
            if (!recipient.Contains('#'))
            {
                message.Reply($"Command is {CommandName} DiscordUsername (include #1234 discriminator)");
                return;
            }

            this.logger.LogInformation($"Attempting to find user with that name.");
            var user = discordSocketClient.GetUser(recipient.Split('#').First(), recipient.Split('#').Last());
            string confirmationCode = Guid.NewGuid().ToString();

            await this.linkRequestsStorage.SaveLinkRequestAsync(new LinkRequest()
            {
                ConfirmationCode = confirmationCode,
                Timestamp = DateTime.Now,
                DiscordUsername = recipient,
                TwitchUsername = message.User
            });

            if (user == null)
            {
                this.logger.LogError($"No user found with the name '{recipient}'.");
                message.Reply($"Cannot find user with that name.");
                return;
            }

            this.logger.LogInformation($"Sending link confirmation DM to user {message.User}.");
            await user.SendMessageAsync(
                $"Reply to this message to link your Discord account with the Twitch username: {message.User}\n\n" +
                $"```!linkdiscord {confirmationCode}```");

        }

        public async Task RunCommandAsync(SocketMessage message, DiscordSocketClient client)
        {
            string messageText = message.Content;
            var messageParts = messageText.Split(' ');
            if (messageParts.Length < 2)
            {
                await message.Channel.SendMessageAsync($"Syntax is:\n" +
                                                       "```!linkdiscord confirmation-code```");
                return;
            }

            string confirmationCode = messageParts[1];
            string author = message.Author.Username + "#" + message.Author.Discriminator;
            var linkRequest = await this.linkRequestsStorage.GetLinkRequestForDiscordUserAsync(author);
            if (linkRequest == null || linkRequest.ConfirmationCode != confirmationCode)
            {
                await message.Channel.SendMessageAsync($"No matching link request for this user and confirmation code.");
                return;
            }

            await this.usersClient.SetDiscordUserAsync(UserReference.FromTwitch(linkRequest.TwitchUsername),
                linkRequest.DiscordUsername);
            await this.linkRequestsStorage.DeleteLinkRequestAsync(linkRequest);
            await message.Channel.SendMessageAsync(
                $"You've linked your Discord account to the Twitch user '{linkRequest.TwitchUsername}'.");
        }

        public string CommandName => "!linkdiscord";
    }
}