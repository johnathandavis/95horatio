// -----------------------------------------------------------------------
// <copyright file="ChatMessage.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Model
{
    using System;

    /// <summary>
    /// A ChatMessage class.
    /// </summary>
    public class ChatMessage
    {
        public DateTime Timestamp { get; set; }
        public string Message { get; set; }
        public string Sentiment { get; set; }
        public double Positivity { get; set; }
        public double Negativity { get; set; }
        public double Neutrality { get; set; }
        public double Mixed { get; set; }
    }
}