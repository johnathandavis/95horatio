// -----------------------------------------------------------------------
// <copyright file="UserSnapshotSummary.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Model
{
    using HoratioBot.Storage;

    /// <summary>
    /// A UserSnapshotSummary class.
    /// </summary>
    public class UserSnapshotSummary
    {
        public int MessageCount { get; set; }
        public SentimentScore Positivity { get; set; }
        public SentimentScore Negativity { get; set; }
        public SentimentScore Neutrality { get; set; }
        public SentimentScore Mixed { get; set; }
    }
}