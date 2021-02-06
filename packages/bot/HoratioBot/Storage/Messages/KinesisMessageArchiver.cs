// -----------------------------------------------------------------------
// <copyright file="KinesisMessageArchiver.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Storage.Messages
{
    using System;
    using System.Collections.Generic;
    using System.IO;
    using System.Linq;
    using System.Text;
    using System.Threading;
    using System.Threading.Tasks;
    using Amazon.Comprehend;
    using Amazon.Comprehend.Model;
    using Amazon.KinesisFirehose;
    using Amazon.KinesisFirehose.Model;
    using HoratioBot.Clients;
    using HoratioBot.Clients.Alerts;
    using HoratioBot.Model;
    using Microsoft.Extensions.Logging;
    using Newtonsoft.Json;
    using Newtonsoft.Json.Linq;
    using Newtonsoft.Json.Serialization;

    /// <summary>
    /// A KinesisMessageArchiver class.
    /// </summary>
    public class KinesisMessageArchiver : IMessageArchiver
    {
        private readonly IAmazonKinesisFirehose firehose;
        private readonly IAmazonComprehend comprehend;
        private readonly IChatMessageStorage chatMessageStorage;
        private readonly IUserIdsStorageManager userIdsStorage;
        private readonly ISentimentSnapshotsStorage sentimentSnapshotsStorage;
        private readonly IAlertBroadcaster broadcaster;
        private readonly ILogger<KinesisMessageArchiver> logger;
        private readonly string deliveryStreamName;

        public KinesisMessageArchiver(
            IAmazonKinesisFirehose firehose,
            IAmazonComprehend comprehend,
            IChatMessageStorage storage,
            IUserIdsStorageManager userIdsStorage,
            ISentimentSnapshotsStorage sentimentSnapshotsStorage,
            IAlertBroadcaster broadcaster,
            ILogger<KinesisMessageArchiver> logger,
            string deliveryStreamName)
        {
            this.firehose = firehose;
            this.comprehend = comprehend;
            this.userIdsStorage = userIdsStorage;
            this.sentimentSnapshotsStorage = sentimentSnapshotsStorage;
            this.chatMessageStorage = storage;
            this.broadcaster = broadcaster;
            this.logger = logger;
            this.deliveryStreamName = deliveryStreamName;
        }

        public async Task ArchiveMessageAsync(MessageRecord record)
        {
            var languageResponse = await this.comprehend.DetectDominantLanguageAsync(new DetectDominantLanguageRequest()
            {
                Text = record.Message
            });
            var languages = languageResponse.Languages;
            string languageCode = "en";
            if ((languages?.Count ?? 0) > 0)
            {
                languageCode = languages.OrderByDescending(lang => lang.Score).First().LanguageCode;
            }

            DetectSentimentResponse sentimentResponse;
            if (languageCode == "id" && record.SourceUsername == "chelsiemonica")
            {
                sentimentResponse = new DetectSentimentResponse()
                {
                    Sentiment = SentimentType.NEGATIVE,
                    SentimentScore = new SentimentScore()
                    {
                        Positive = 0.0f,
                        Mixed = 0.0f,
                        Neutral = 0.0f,
                        Negative = 1.0f
                    }
                };
            }
            else
            {
                sentimentResponse = await this.comprehend.DetectSentimentAsync(new DetectSentimentRequest()
                {
                    Text = record.Message,
                    LanguageCode = languageCode
                });
            }
            var row = await this.chatMessageStorage.GetChatMessageRowByIdAsync(record.SourceMessageId);
            row.Sentiment = new MessageSentiment()
            {
                Sentiment = sentimentResponse.Sentiment.Value,
                Positivity = sentimentResponse.SentimentScore.Positive,
                Negativity = sentimentResponse.SentimentScore.Negative,
                Neutrality = sentimentResponse.SentimentScore.Neutral,
                Mixed = sentimentResponse.SentimentScore.Mixed
            };
            await this.chatMessageStorage.UpdateChatMessageAsync(row);

            UserIdRow userIdRow = null;
            try
            {
                userIdRow = await this.userIdsStorage.GetUserIdsFromTwitchAsync(row.Sender);
            }
            catch
            {
            }

            List<SentimentSnapshotRow> snapshotRows = new List<SentimentSnapshotRow>();
            if (userIdRow != null)
            {
                try
                {
                    snapshotRows = await this.sentimentSnapshotsStorage.GetUserSnapshotsAsync(userIdRow.CognitoUsername);
                }
                catch
                {
                }
            }

            var snapshotRow = snapshotRows?.FirstOrDefault();

            await this.broadcaster.BroadcastAsync(new Alert()
            {
                Type = AlertType.Sentiment,
                Sentiment = new SentimentAlert()
                {
                    TwitchUsername = row.Sender,
                    Score = row.Sentiment,
                    Message = row.MessageContents,
                    TimestampEpochSeconds = new DateTimeOffset(DateTime.UtcNow).ToUnixTimeSeconds(),
                    Summary = new UserSnapshotSummary()
                    {
                        MessageCount = snapshotRow?.MessageCount ?? 0,
                        Positivity = snapshotRow?.Positivity,
                        Negativity = snapshotRow?.Negativity,
                        Mixed = snapshotRow?.Mixed,
                        Neutrality = snapshotRow?.Neutrality
                    }
                }
            });

            var sentimentJson = JObject.Parse(JsonConvert.SerializeObject(sentimentResponse.Sentiment));
            var sentimentScoreJson = JObject.Parse(JsonConvert.SerializeObject(sentimentResponse.SentimentScore));
            var messageJson = JObject.Parse(JsonConvert.SerializeObject(record));
            foreach (var kvp in sentimentJson)
            {
                string newKey = "sentiment" + kvp.Key;
                messageJson[newKey] = kvp.Value;
            }
            foreach (var kvp in sentimentScoreJson)
            {
                string newKey = "sentiment" + kvp.Key;
                messageJson[newKey] = kvp.Value;
            }

            string json = JsonConvert.SerializeObject(messageJson, new JsonSerializerSettings()
            {
                NullValueHandling = NullValueHandling.Include,
                ContractResolver = new CamelCasePropertyNamesContractResolver()
            }) + "\n";
            using var ms = new MemoryStream(Encoding.UTF8.GetBytes(json));
            var sendRequest = new PutRecordRequest()
            {
                DeliveryStreamName = this.deliveryStreamName,
                Record = new Record()
                {
                    Data = ms
                }
            };

            await this.firehose.PutRecordAsync(sendRequest);
            this.logger.LogInformation($"Archived message {record.SourceMessageId}:\nMessage: \"{record.Message}\" from {record.SourceUsername} with sentiment:" +
                                       $"\n{JsonConvert.SerializeObject(sentimentScoreJson)}");
        }
    }
}