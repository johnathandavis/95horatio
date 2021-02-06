// -----------------------------------------------------------------------
// <copyright file="PaginationRecord.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Storage
{
    using Amazon.DynamoDBv2.DataModel;

    /// <summary>
    /// A PaginationRecord class.
    /// </summary>
    [DynamoDBTable("replaced-at-runtime")]
    public class PaginationRecord
    {
        [DynamoDBHashKey("token")]
        public string Token { get; set; }

        [DynamoDBProperty("next-item-map")]
        public string NextItemMapJson { get; set; }

        [DynamoDBProperty("expiration")]
        public long ExpirationTimestampSeconds { get; set; }
    }
}