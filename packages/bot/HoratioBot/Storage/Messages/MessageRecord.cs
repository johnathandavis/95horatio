// -----------------------------------------------------------------------
// <copyright file="MessageRecord.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Storage.Messages
{
    using System;

    /// <summary>
    /// A MessageRecord class.
    /// </summary>
    public class MessageRecord
    {
        public string Message { get; set; }
        public MessageSource Source { get; set; }
        public DateTime Timestamp { get; set; }
        public string SourceMessageId { get; set; }
        public string SourceUsername { get; set; }
    }
}