// -----------------------------------------------------------------------
// <copyright file="SocketSessionRow.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Storage
{
    using System;
    using Amazon.DynamoDBv2.DataModel;

    /// <summary>
    /// A SocketSessionRow class.
    /// </summary>
    [DynamoDBTable("replaced-at-runtime")]
    public class SocketSessionRow
    {
        [DynamoDBHashKey("connectionId")]
        public string ConnectionId { get; set; }

        [DynamoDBProperty("connectionStartTime")]
        public DateTime ConnectionStartTime { get; set; }

        [DynamoDBProperty("expireTime")]
        public long ExpireTimeSeconds =>
            new DateTimeOffset(ConnectionStartTime + TimeSpan.FromDays(1)).ToUnixTimeSeconds();

        [DynamoDBGlobalSecondaryIndexHashKey(AttributeName = "connectedUser", IndexNames = new []
        {
            "userIndex"
        })]
        public string ConnectedUser { get; set; }
    }
}