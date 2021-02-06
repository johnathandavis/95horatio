// -----------------------------------------------------------------------
// <copyright file="IDiscordCredentialProvider.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Credentials
{
    using System.Threading.Tasks;

    public interface IDiscordCredentialProvider
    {
        Task<DiscordCredentials> GetCredentialsAsync();
    }
}