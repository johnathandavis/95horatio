// -----------------------------------------------------------------------
// <copyright file="IUserIdsStorageManager.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Storage
{
    using System.Threading.Tasks;

    public interface IUserIdsStorageManager
    {
        Task<UserIdRow> GetUserIdsFromCognitoAsync(string cognitoId);
        Task<UserIdRow> GetUserIdsFromTwitchAsync(string twitchId);
        Task<UserIdRow> GetUserIdsFromSubAsync(string sub);
    }
}