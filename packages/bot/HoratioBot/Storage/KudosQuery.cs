// -----------------------------------------------------------------------
// <copyright file="KudosQuery.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Storage
{
    using System;

    /// <summary>
    /// A KudosQuery class.
    /// </summary>
    public record KudosQuery
    {
        public string FromUser { get; set; }
        public string RecipientUser { get; set; }
        public TimeSpan TimeAgo { get; set; } = TimeSpan.FromDays(1);
    }
}