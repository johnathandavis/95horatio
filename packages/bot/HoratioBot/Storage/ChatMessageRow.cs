// -----------------------------------------------------------------------
// <copyright file="ChatMessageRow.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Storage
{
    using System;
    using Amazon.DynamoDBv2.DataModel;
    using Discord;
    using HoratioBot.Storage.Messages;

    /// <summary>
    /// A ChatMessageRow class.
    /// </summary>
    public class ChatMessageRow
    {
        [DynamoDBHashKey("messageId")]
        public string MessageId { get; set; }

        [DynamoDBProperty("messageContents")]
        public string MessageContents { get; set; }

        [DynamoDBProperty("sentiment")]
        public MessageSentiment Sentiment { get; set; }

        [DynamoDBIgnore]
        public string Sender { get; set; }

        [DynamoDBIgnore]
        public string Provider { get; set; }

        [DynamoDBGlobalSecondaryIndexHashKey(
            AttributeName = "senderUsername",
            IndexNames = new []{"sender-index"})]
        public string SenderProviderCompositeKey
        {
            get
            {
                return $"{Provider}:{Sender}";
            }
            set
            {
                if (!string.IsNullOrEmpty(value) && value.Contains(":"))
                {
                    var senderParts = value.Split(':');
                    Provider = senderParts[0];
                    Sender = senderParts[1];
                }
            }
        }

        [DynamoDBGlobalSecondaryIndexRangeKey(
            AttributeName = "timestamp",
            IndexNames = new []{"sender-index"},
            Converter = typeof(FlexibleTimestampConverter)),]
        public DateTime Timestamp { get; set; }

        [DynamoDBProperty("metadata")]
        public string Metadata { get; set; }
    }
}