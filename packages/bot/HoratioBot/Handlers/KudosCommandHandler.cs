// -----------------------------------------------------------------------
// <copyright file="KudosCommandHandler.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Handlers
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text.RegularExpressions;
    using System.Threading.Tasks;
    using Amazon.DynamoDBv2;
    using Discord;
    using Discord.WebSocket;
    using HoratioBot.Clients;
    using HoratioBot.Storage;
    using Microsoft.Extensions.Logging;

    /// <summary>
    /// A KudosCommandHandler class.
    /// </summary>
    public class KudosCommandHandler : IDiscordCommandHandler
    {
        private const int KUDO_LIMIT = 3;
        private const float POSITIVITY_THRESHOLD = 0.5f;
        private static readonly TimeSpan KUDO_TIME_RANGE = TimeSpan.FromDays(1);

        private readonly IKudosStorageManager kudosStorageManager;
        private readonly ISentimentAnalysisClient sentimentAnalysisClient;
        private readonly ILogger<KudosCommandHandler> logger;
        private readonly ulong serverId;
        private readonly ulong channelId;

        public string CommandName => "!kudos";

        public KudosCommandHandler(
            IKudosStorageManager storageManager,
            ISentimentAnalysisClient sentimentAnalysisClient,
            ulong serverId,
            ulong channelId,
            ILogger<KudosCommandHandler> logger)
        {
            this.kudosStorageManager = storageManager;
            this.sentimentAnalysisClient = sentimentAnalysisClient;
            this.serverId = serverId;
            this.channelId = channelId;
            this.logger = logger;
        }

        public async Task RunCommandAsync(SocketMessage message, DiscordSocketClient client)
        {
            string messageText = message.Content;
            var messageParts = messageText.Split(' ');
            if (messageParts.Length < 2)
            {
                await message.Channel.SendMessageAsync($"Syntax is:\n" +
                                                       "```!kudos command```\n" +
                                                       "Where 'command' is one of:\n" +
                                                       "  * post      (to post a kudo to someone else)" +
                                                       "  * retract   (to remove your last kudo)" +
                                                       "  * delete    (to delete the last kudo about you)");
            }

            var kudoCommand = messageParts[1].ToLower();
            switch (kudoCommand)
            {
                case "post":
                    await RunPostKudoCommandAsync(message, client);
                    break;
                case "retract":
                    await RunRetractKudoCommandAsync(message, client);
                    break;
                case "delete":
                    await RunDeleteKudoCommandAsync(message, client);
                    break;
                default:
                    await message.Channel.SendMessageAsync($"Syntax is:\n" +
                                                       "```!kudos command```\n" +
                                                       "Where 'command' is one of:\n" +
                                                       "  * post      (to post a kudo to someone else)" +
                                                       "  * retract   (to remove your last kudo)" +
                                                       "  * delete    (to delete the last kudo about you)");
                    break;
            }
        }

        private async Task RunRetractKudoCommandAsync(SocketMessage message, DiscordSocketClient client)
        {
            // Format of message is:
            // !kudos retract

            string messageText = message.Content;
            var messageParts = messageText.Split(' ');
            if (messageParts.Length != 2)
            {
                await message.Channel.SendMessageAsync($"Syntax is:\n" +
                                                       "```!kudos retract```");
                return;
            }

            string fullUsername = message.Author.Username + "#" + message.Author.Discriminator;
            var myMessages = await this.kudosStorageManager.QueryUserKudosAsync(new KudosQuery()
            {
                FromUser = fullUsername,
            });
            var myLastMessage =
                (from msg in myMessages
                    where msg.Status == KudosStatus.Posted
                    orderby msg.Timestamp descending
                    select msg).FirstOrDefault();
            if (myLastMessage == default(KudosRecord))
            {
                await message.Channel.SendMessageAsync($"You have no kudos in the past day that are eligible for retraction.");
                return;
            }

            myLastMessage.Status = KudosStatus.Retracted;
            await client.GetGuild(serverId).GetTextChannel(channelId).DeleteMessageAsync(
                ulong.Parse(myLastMessage.DiscordMessageId), new RequestOptions()
                {
                    AuditLogReason =
                        $"Deleted on behalf of {message.Author.Username}#{message.Author.Discriminator} as a Kudos retraction."
                });
            await message.Channel.SendMessageAsync($"Deleted message, you can resubmit!");
            await kudosStorageManager.SaveKudoAsync(myLastMessage);
        }

        private async Task RunDeleteKudoCommandAsync(SocketMessage message, DiscordSocketClient client)
        {
            // Format of message is:
            // !kudos delete MessageLink
            // https://discord.com/channels/799375962998833152/799395846915489822/799697768389935104
            var messageLinkRegex = "https:\\/\\/discord.com\\/channels\\/[0-9]{10,}\\/[0-9]{10,}\\/[0-9]{10,}";

            var messageParts = message.Content.Split(' ');
            if (messageParts.Length < 3)
            {
                await message.Channel.SendMessageAsync($"Syntax is:\n" +
                                                       "```!kudos delete MessageLink```");
                return;
            }

            if (!Regex.IsMatch(messageParts[2], messageLinkRegex))
            {
                await message.Channel.SendMessageAsync($"The message link should be similar to: https://discord.com/channels/799375962998833152/799395846915489822/799697768389935104");
                return;
            }

            var linkParts = messageParts[2].Split('/');
            var messageId = linkParts.Last();
            var kudo = await kudosStorageManager.GetKudoByDiscordMessageId(messageId);

            if (kudo == default(KudosRecord))
            {
                await message.Channel.SendMessageAsync($"No message found with that link.");
                return;
            }

            if (kudo.RecipientUserId != message.Author.Id.ToString())
            {
                await message.Channel.SendMessageAsync($"You can only delete kudos that you have sent.");
                return;
            }

            kudo.Status = KudosStatus.Deleted;
            await this.kudosStorageManager.SaveKudoAsync(kudo);
            await client.GetGuild(serverId).GetTextChannel(channelId).DeleteMessageAsync(
                ulong.Parse(kudo.DiscordMessageId),
                new RequestOptions()
                {
                    AuditLogReason = "Deleted by request of kudo recipient."
                });
            await message.Channel.SendMessageAsync($"Deleted kudo!");

        }

        private async Task RunPostKudoCommandAsync(SocketMessage message, DiscordSocketClient client)
        {
            // Format of message is:
            // !kudos recipient message

            string messageText = message.Content;
            var messageParts = messageText.Split(' ');
            if (messageParts.Length < 4)
            {
                await message.Channel.SendMessageAsync($"Syntax is:\n" +
                                                       "```!kudos post recipient message```");
                return;
            }
            logger.LogInformation($"Received valid message from {message.Author.Username}#{message.Author.Discriminator}: \"{message.Content}\"");

            string recipient = messageParts[2];
            logger.LogInformation($"In kudos post command, using recipient \"{recipient}\".");

            string kudosMessage = string.Join(' ', messageParts.Skip(3));

            var potentialRecipientUsers = await GetPotentialUsersFromRecipient(recipient, client);
            if (potentialRecipientUsers.Count == 0)
            {
                await message.Channel.SendMessageAsync($"Sorry, I can't find anyone with the username '{recipient}'.");
                return;
            }
            else if (potentialRecipientUsers.Count > 1)
            {
                var duplicateText = potentialRecipientUsers.Select(u => u.Username + "#" + u.Discriminator);
                await message.Channel.SendMessageAsync($"Sorry, I found multiple users with the username '{recipient}':\n{string.Join(", ", duplicateText)}");
                return;
            }

            var recipientUser = potentialRecipientUsers.First();
            var receipientId = recipientUser.Id;
            logger.LogInformation($"Resolved given recipient \"{recipient}\" to user \"{recipientUser.Username}#{recipientUser.Discriminator}\".");

            var allDailyKudos = await this.kudosStorageManager.QueryUserKudosAsync(new KudosQuery()
            {
                FromUser = message.Author.Username
            });
            var activeDailyKudos = allDailyKudos.Where(kudo => kudo.Status != KudosStatus.Retracted).ToList();

            if (activeDailyKudos.Count >= KUDO_LIMIT)
            {
                this.logger.LogInformation($"User {message.Author.Username} has already sent the max number of kudos in one day (3).");
                var oldestKudoTimestamp = (from k in activeDailyKudos orderby k.Timestamp ascending select k).First().Timestamp;
                var timeUntilNext = DateTime.Now - KUDO_TIME_RANGE;
                var remainingTime = oldestKudoTimestamp - timeUntilNext;
                await message.Channel.SendMessageAsync($"Uh-oh, you've already sent {KUDO_LIMIT} kudos in one day! You can send the next kudo in {remainingTime}!");
                return;
            }
            this.logger.LogInformation($"User {message.Author.Username} has sent {activeDailyKudos.Count} kudos in the past 24 hours.");

            var positivity = await this.sentimentAnalysisClient.AnalyzePositivityAsync(message.Content);

            if (positivity < POSITIVITY_THRESHOLD)
            {
                this.logger.LogInformation($"User {message.Author.Username} message \"{message.Content}\" did not meet the positive threshold.\n" +
                                           $"The threshold is {POSITIVITY_THRESHOLD} and the message had a positivity score of {positivity}.");
                await message.Channel.SendMessageAsync($"Uh-oh, that doesn't look very nice!");
                return;
            }
            this.logger.LogInformation($"User {message.Author.Username} message \"{message.Content}\" passed with a positivity score of {positivity}.");


            await message.Channel.SendMessageAsync($"Your kudos to {recipient} has been publicly posted!");
            var kudosMsg = await client.GetGuild(serverId).GetTextChannel(channelId).SendMessageAsync(
                $"<@{receipientId}> Someone posted a kudo about you:\n> {kudosMessage}");

            var messageRecord = new KudosRecord()
            {
                RequesterUsername = message.Author.Username + "#" + message.Author.Discriminator,
                RequesterUserId = message.Author.Id.ToString(),

                RecipientUsername = recipientUser.Username + "#" + recipientUser.Discriminator,
                RecipientUserId = recipientUser.Id.ToString(),

                ServerId = serverId.ToString(),
                ChannelId = channelId.ToString(),
                DiscordMessageId = kudosMsg.Id.ToString(),

                Message = kudosMessage,
                Status = KudosStatus.Posted,
                Positivity = positivity,
                Timestamp = DateTime.Now,
            };

            await this.kudosStorageManager.SaveKudoAsync(messageRecord);
        }

        private async Task<List<SocketGuildUser>> GetPotentialUsersFromRecipient(string recipient, DiscordSocketClient client)
        {
            var guild = client.GetGuild(this.serverId);
            var guildUsers = guild.Users.ToList();
            SocketGuildUser recipientUser;
            if (recipient.Contains("#"))
            {
                recipientUser = guildUsers.FirstOrDefault(u =>
                    $"{u.Username.ToLower()}#{u.Discriminator}" == recipient.ToLower());
                if (recipientUser == default(SocketGuildUser))
                {
                    return new List<SocketGuildUser>();
                }

                return new List<SocketGuildUser>(new[]
                {
                    recipientUser
                });
            }
            else
            {
                return client.GetGuild(this.serverId).Users.Where(u => u.Username == recipient).ToList();
            }
        }
    }
}