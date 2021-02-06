// -----------------------------------------------------------------------
// <copyright file="SentKudo.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Model
{
    using System;

    /// <summary>
    /// A SentKudo class.
    /// </summary>
    public class SentKudo
    {
        public DateTime Timestamp { get; set; }
        public string Recipient { get; set; }
        public string Message { get; set; }
    }
}