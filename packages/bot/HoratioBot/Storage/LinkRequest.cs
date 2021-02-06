// -----------------------------------------------------------------------
// <copyright file="LinkRequest.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Storage
{
    using System;
    using Amazon.DynamoDBv2.DataModel;

    /// <summary>
    /// A LinkRequest class.
    /// </summary>
    [DynamoDBTable("replaced-at-runtime")]
    public class LinkRequest
    {
        [DynamoDBHashKey(AttributeName = "twitchUsername")]
        [DynamoDBGlobalSecondaryIndexRangeKey(AttributeName = "twitchUsername")]
        public string TwitchUsername { get; set; }

        [DynamoDBGlobalSecondaryIndexHashKey(AttributeName = "discordUsername", IndexNames = new []
        {
            "discord2twitchIndex"
        })]
        [DynamoDBRangeKey(AttributeName = "discordUsername")]
        public string DiscordUsername { get; set; }

        [DynamoDBProperty("confirmationCode")]
        public string ConfirmationCode { get; set; }

        [DynamoDBProperty("timestamp")]
        public DateTime Timestamp { get; set; }
    }
}