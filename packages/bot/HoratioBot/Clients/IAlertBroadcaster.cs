// -----------------------------------------------------------------------
// <copyright file="IAlertBroadcaster.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Clients
{
    using System.Threading.Tasks;
    using HoratioBot.Clients.Alerts;

    public interface IAlertBroadcaster
    {
        Task BroadcastAsync(Alert alert);
    }
}