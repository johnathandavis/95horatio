// -----------------------------------------------------------------------
// <copyright file="ReceivedKudo.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Model
{
    using System;

    /// <summary>
    /// A ReceivedKudo class.
    /// </summary>
    public class ReceivedKudo
    {
        public DateTime Timestamp { get; set; }
        public string Message { get; set; }
    }
}