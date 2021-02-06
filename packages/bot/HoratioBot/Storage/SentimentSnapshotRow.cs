// -----------------------------------------------------------------------
// <copyright file="SentimentSnapshotRow.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Storage
{
    using System;
    using Amazon.DynamoDBv2.DataModel;

    /// <summary>
    /// A SentimentSnapshotRow class.
    /// </summary>
    [DynamoDBTable("replaced-at-runtime")]
    public class SentimentSnapshotRow
    {
        [DynamoDBHashKey("cognitoId")]
        public string CognitoUsername { get; set; }
        [DynamoDBRangeKey("timestamp")]
        public DateTime Timestamp { get; set; }

        [DynamoDBProperty("messageCount")]
        public int MessageCount { get; set; }
        [DynamoDBProperty("messageCountRank")]
        public int MessageCountRank { get; set; }

        [DynamoDBProperty("positivity")]
        public SentimentScore Positivity { get; set; }
        [DynamoDBProperty("negativity")]
        public SentimentScore Negativity { get; set; }
        [DynamoDBProperty("neutrality")]
        public SentimentScore Neutrality { get; set; }
        [DynamoDBProperty("mixed")]
        public SentimentScore Mixed { get; set; }
    }
}