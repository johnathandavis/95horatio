// -----------------------------------------------------------------------
// <copyright file="ICountersStorage.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Storage
{
    using System.Threading.Tasks;

    public interface ICountersStorage
    {
        Task IncrementTwitchMsgCountAsync(string twitchUsername);
        Task IncrementDiscordMsgCountAsync(string discord);

        Task GetMsgCountsAsync(string twitchUsername);
    }
}