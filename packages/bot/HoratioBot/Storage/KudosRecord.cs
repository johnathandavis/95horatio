// -----------------------------------------------------------------------
// <copyright file="KudosRecord.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Storage
{
    using System;
    using Amazon.DynamoDBv2.DataModel;

    /// <summary>
    /// A KudosRecord class.
    /// </summary>
    [DynamoDBTable("replaced-at-runtime")]
    public class KudosRecord
    {
        [DynamoDBHashKey("requesterUsername")]  public string RequesterUsername { get; set; }
        [DynamoDBProperty("requesterUserId")] public string RequesterUserId { get; set; }

        [DynamoDBGlobalSecondaryIndexHashKey("recipientUsername", IndexNames = new [] { "recipientIndex" })]
        [DynamoDBProperty("recipientUsername")] public string RecipientUsername { get; set; }
        [DynamoDBProperty("recipientUserId")] public string RecipientUserId { get; set; }

        [DynamoDBProperty("serverId")] public string ServerId { get; set; }
        [DynamoDBGlobalSecondaryIndexHashKey(AttributeName = "discordMessageId", IndexNames = new []{ "messageIdIndex" })] public string DiscordMessageId { get; set; }
        [DynamoDBProperty("channelId")] public string ChannelId { get; set; }

        [DynamoDBRangeKey("timestamp")] [DynamoDBGlobalSecondaryIndexRangeKey("timestamp", IndexNames = new []
        {
            "recipientIndex",
            "messageIdIndex"
        })] public DateTime Timestamp { get; set; }
        [DynamoDBProperty("lastStatusChange")] public DateTime LastStatusChange { get; set; }

        [DynamoDBProperty("positivity")] public float Positivity { get; set; }
        [DynamoDBProperty("message")] public string Message { get; set; }
        [DynamoDBProperty(AttributeName = "status", Converter = typeof(KudosStatusTypeConverter))]  public KudosStatus Status { get; set; }
    }
}