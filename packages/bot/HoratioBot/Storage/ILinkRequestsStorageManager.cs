// -----------------------------------------------------------------------
// <copyright file="ILinkRequestsManager.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Storage
{
    using System.Threading.Tasks;

    public interface ILinkRequestsStorageManager
    {
        Task<LinkRequest> GetLinkRequestForDiscordUserAsync(string discordUsername);
        Task SaveLinkRequestAsync(LinkRequest request);
        Task DeleteLinkRequestAsync(LinkRequest request);
    }
}