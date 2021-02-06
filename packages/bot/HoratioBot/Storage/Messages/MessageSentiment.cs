// -----------------------------------------------------------------------
// <copyright file="MessageSentiment.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Storage.Messages
{
    using Amazon.DynamoDBv2.DataModel;

    /// <summary>
    /// A MessageSentiment class.
    /// </summary>
    public class MessageSentiment
    {
        [DynamoDBProperty("sentiment")]
        public string Sentiment { get; set; }
        [DynamoDBProperty("positivity")]
        public double Positivity { get; set; }
        [DynamoDBProperty("negativity")]
        public double Negativity { get; set; }
        [DynamoDBProperty("neutrality")]
        public double Neutrality { get; set; }
        [DynamoDBProperty("mixed")]
        public double Mixed { get; set; }
    }
}