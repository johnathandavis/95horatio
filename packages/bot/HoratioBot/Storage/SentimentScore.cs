// -----------------------------------------------------------------------
// <copyright file="SentimentScore.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Storage
{
    using Amazon.DynamoDBv2.DataModel;

    /// <summary>
    /// A SentimentScore class.
    /// </summary>
    public class SentimentScore
    {
        [DynamoDBProperty("value")]
        public double Value { get; set; }
        [DynamoDBProperty("rank")]
        public int Rank { get; set; }
        [DynamoDBProperty("total")]
        public int Total { get; set; }
    }
}