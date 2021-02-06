// -----------------------------------------------------------------------
// <copyright file="IUsersClient.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Clients
{
    using System.Threading.Tasks;

    public interface IUsersClient
    {
        Task SetDiscordUserAsync(UserReference userReference, string discordUsername);
        Task<UserInfo> GetUserInfoAsync(UserReference userReference);
    }
}