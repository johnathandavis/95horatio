// -----------------------------------------------------------------------
// <copyright file="ITwitchCredentialsProvider.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Credentials
{
    using System.Threading.Tasks;

    public interface ITwitchCredentialsProvider
    {
        Task<TwitchCredentials> GetCredentialsAsync();
    }
}