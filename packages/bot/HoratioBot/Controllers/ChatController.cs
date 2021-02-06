// -----------------------------------------------------------------------
// <copyright file="SentimentController.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Controllers
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using HoratioBot.Model;
    using HoratioBot.Storage;
    using HoratioBot.Storage.Messages;
    using HoratioBot.Web;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.Extensions.Logging;

    [ApiController]
    public class ChatController : ControllerBase
    {
        private readonly ISentimentSnapshotsStorage sentimentSnapshotsStorage;
        private readonly IChatMessageStorage chatMessageStorage;
        private readonly ILogger<ChatController> logger;

        public ChatController(
            ISentimentSnapshotsStorage sentimentSnapshotsStorage,
            IChatMessageStorage chatMessageStorage,
            ILogger<ChatController> logger)
        {
            this.sentimentSnapshotsStorage = sentimentSnapshotsStorage;
            this.chatMessageStorage = chatMessageStorage;
            this.logger = logger;
        }

        [HttpGet]
        [Route("chat/summary")]
        public async Task<SentimentSnapshotRow> GetChatSummaryAsync()
        {
            var user = Request.GetRequesterInfo();
            var snapshots = await this.sentimentSnapshotsStorage.GetUserSnapshotsAsync(user.CognitoUsername);
            return snapshots
                .OrderByDescending(k => k.Timestamp).FirstOrDefault();
        }

        [HttpGet]
        [Route("chat")]
        public async Task<ListChatsResponse> ListChatsAsync(
            [FromQuery] string paginationToken,
            [FromQuery] string order,
            [FromQuery] string provider)
        {
            string user;
            if (provider.ToLower() == "twitch")
            {
                user = "twitch:" + Request.GetRequesterInfo().TwitchUsername;
            }
            else if (provider.ToLower() == "discord")
            {
                user = "discord:" + Request.GetRequesterInfo().DiscordUsername;
            }
            else
            {
                throw new ArgumentException($"Invalid provider.");
            }

            bool oldestToNewest = order.ToLower() == "ascending";

            this.logger.LogInformation($"Received ListChats request for user '{user}', order '{order}', " +
                                      $"provider '{provider}' and pagination token '{paginationToken}'.");

            var snapshots = await this.chatMessageStorage.ListChatsBySenderAsync(
                user,
                oldestToNewest,
                paginationToken);
            return new ListChatsResponse()
            {
                PaginationToken = snapshots.PaginationToken,
                Messages = snapshots.Results.Select(item => new ChatMessage()
                {
                    Message = item.MessageContents,
                    Timestamp = item.Timestamp,
                    Sentiment = item.Sentiment != null ? AssumeSentiment(item.Sentiment) : "Unknown",
                    Positivity = item.Sentiment?.Positivity ?? 0.0,
                    Negativity = item.Sentiment?.Negativity ?? 0.0,
                    Neutrality = item.Sentiment?.Neutrality ?? 0.0,
                    Mixed = item.Sentiment?.Mixed ?? 0.0,
                }).ToList()
            };
        }

        private static string AssumeSentiment(MessageSentiment sentiment)
        {
            var sentiments = new Dictionary<string, double>();
            sentiments.Add("Positive",sentiment.Positivity);
            sentiments.Add("Negative",sentiment.Negativity);
            sentiments.Add("Neutral",sentiment.Neutrality);
            sentiments.Add("Mixed",sentiment.Mixed);
           return sentiments.OrderBy(kvp => kvp.Value).Last().Key;
        }
    }
}