// -----------------------------------------------------------------------
// <copyright file="DiscordMessageRecord.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Storage.Messages
{
    /// <summary>
    /// A DiscordMessageRecord class.
    /// </summary>
    public class DiscordMessageRecord : MessageRecord
    {
        public DiscordMessageType MessageType { get; set; }
        public string ServerId { get; set; }
        public string ChannelId { get; set; }

        public string FromUserId { get; set; }
        public string FromUserDiscriminator { get; set; }
    }
}