// -----------------------------------------------------------------------
// <copyright file="IKudosStorageManager.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Storage
{
    using System;
    using System.Collections.Generic;
    using System.Threading.Tasks;

    public interface IKudosStorageManager
    {
        Task SaveKudoAsync(KudosRecord record);
        Task<KudosRecord> GetKudoByDiscordMessageId(string discordMessageId);
        Task<List<KudosRecord>> QueryUserKudosAsync(KudosQuery query);
    }
}