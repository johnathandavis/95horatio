// -----------------------------------------------------------------------
// <copyright file="ISocketSessionStorage.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Storage
{
    using System.Collections.Generic;
    using System.Threading.Tasks;

    public interface ISocketSessionStorage
    {
        Task PutSessionAsync(SocketSessionRow row);
        Task DeleteSessionByIdAsync(string connectionId);
        Task<SocketSessionRow> GetSessionByConnectionIdAsync(string connectionId);
        Task<List<SocketSessionRow>> ListSessionsByUserAsync(string user);
        Task<List<SocketSessionRow>> ListAllSessionsAsync();
    }
}