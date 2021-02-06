// -----------------------------------------------------------------------
// <copyright file="SentimentReportGenerator.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Services
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading;
    using System.Threading.Tasks;
    using Amazon.SQS;
    using Amazon.SQS.Model;
    using HoratioBot.Clients.Discovery;
    using HoratioBot.Storage;
    using Microsoft.Extensions.Hosting;
    using Microsoft.Extensions.Logging;

    /// <summary>
    /// A SentimentReportGenerator class.
    /// </summary>
    public class SentimentReportGenerator : BackgroundService
    {
        private readonly IAmazonSQS sqs;
        private readonly string queueUrl;
        private readonly ISentimentReporter reporter;
        private readonly IUserIdsStorageManager userIdsStorageManager;
        private readonly ISentimentSnapshotsStorage sentimentSnapshotsStorage;
        private readonly ILogger<SentimentReportGenerator> logger;

        public SentimentReportGenerator(
            IAmazonSQS sqs,
            ISentimentReporter reporter,
            AnalyticsResources analyticsResources,
            IUserIdsStorageManager userIdsStorageManager,
            ISentimentSnapshotsStorage sentimentSnapshotsStorage,
            ILogger<SentimentReportGenerator> logger)
        {
            this.sqs = sqs;
            this.reporter = reporter;
            this.logger = logger;
            this.userIdsStorageManager = userIdsStorageManager;
            this.sentimentSnapshotsStorage = sentimentSnapshotsStorage;
            this.queueUrl = analyticsResources.SentimentReportJobQueueUrl;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (true)
            {
                await Task.Delay(TimeSpan.FromSeconds(1), stoppingToken);

                var receiveResponse = await this.sqs.ReceiveMessageAsync(new ReceiveMessageRequest()
                {
                    QueueUrl = this.queueUrl,
                    MaxNumberOfMessages = 1,
                    WaitTimeSeconds = 20,
                }, stoppingToken);
                var messages = receiveResponse.Messages ?? new List<Message>();
                if (messages.Count > 0)
                {
                    var msg = messages.First();

                    try
                    {
                        await GenerateReportAsync(stoppingToken);
                    }
                    catch (Exception e)
                    {
                        this.logger.LogError($"Error generating sentiment report:\n{e}", e);
                        continue;
                    }

                    await this.sqs.DeleteMessageAsync(new DeleteMessageRequest()
                    {
                        QueueUrl = this.queueUrl,
                        ReceiptHandle = msg.ReceiptHandle
                    }, stoppingToken);
                }
            }
        }

        private async Task GenerateReportAsync(CancellationToken token)
        {
            var report = await reporter.GenerateSentimentReportAsync(token);

            var sortedByPositivity = report.OrderByDescending(r => r.Positivity).ToList();
            var sortedByNegativity = report.OrderByDescending(r => r.Negativity).ToList();
            var sortedByNeutrality = report.OrderByDescending(r => r.Neutrality).ToList();
            var sortedByMixed = report.OrderByDescending(r => r.Mixed).ToList();
            var sortedByNumberOfMessages = report.OrderByDescending(r => r.NumberOfMessages).ToList();
            var reportTimestamp = DateTime.UtcNow;
            foreach (var row in report)
            {
                UserIdRow userIds;
                try
                {
                    userIds = await this.userIdsStorageManager.GetUserIdsFromTwitchAsync(row.Username);
                }
                catch (UserIdNotFoundException)
                {
                    continue;
                }

                var snapshot = new SentimentSnapshotRow();
                snapshot.Positivity = CreateScore(row, sortedByPositivity, (r) => r.Positivity);
                snapshot.Negativity = CreateScore(row, sortedByNegativity, (r) => r.Negativity);
                snapshot.Mixed = CreateScore(row, sortedByMixed, (r) => r.Mixed);
                snapshot.Neutrality = CreateScore(row, sortedByNeutrality, (r) => r.Neutrality);

                var msgCountIndex = sortedByNumberOfMessages.IndexOf(row);
                snapshot.MessageCount = row.NumberOfMessages;
                snapshot.MessageCountRank = msgCountIndex + 1;

                snapshot.Timestamp = reportTimestamp;
                snapshot.CognitoUsername = userIds.CognitoUsername;
                await this.sentimentSnapshotsStorage.SaveUserSnapshotAsync(snapshot);
            }
        }

        private SentimentScore CreateScore(
            SentimentReportRow myRow,
            List<SentimentReportRow> rows,
            Func<SentimentReportRow, double> scoreSelector)
        {
            var indexOf = rows.IndexOf(myRow);
            return new SentimentScore()
            {
                Value = scoreSelector(myRow),
                Rank = indexOf + 1
            };
        }
    }
}