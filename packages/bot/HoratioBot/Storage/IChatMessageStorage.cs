// -----------------------------------------------------------------------
// <copyright file="IChatMessageStorage.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Storage
{
    using System.Collections.Generic;
    using System.Threading.Tasks;

    public interface IChatMessageStorage
    {
        Task<bool> PutMessageIfNotDuplicateAsync(ChatMessageRow row);
        Task UpdateChatMessageAsync(ChatMessageRow row);
        Task<ChatMessageRow> GetChatMessageRowByIdAsync(string messageId);
        Task<PaginatedResult<ChatMessageRow>> ListChatsBySenderAsync(
            string username,
            bool oldestToNewest,
            string paginationToken = null);
    }
}