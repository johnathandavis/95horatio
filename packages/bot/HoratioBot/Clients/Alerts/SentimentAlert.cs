// -----------------------------------------------------------------------
// <copyright file="SentimentAlert.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Clients.Alerts
{
    using HoratioBot.Model;
    using HoratioBot.Storage.Messages;

    /// <summary>
    /// A SentimentAlert class.
    /// </summary>
    public class SentimentAlert
    {
        public long TimestampEpochSeconds { get; set; }
        public string TwitchUsername { get; set; }
        public string Message { get; set; }
        public MessageSentiment Score { get; set; }
        public UserSnapshotSummary Summary { get; set; }
    }
}