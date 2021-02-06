// -----------------------------------------------------------------------
// <copyright file="IResourceDiscoverer.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Clients.Discovery
{
    public interface IResourceDiscoverer
    {
        AuthResources Auth { get; }
        StorageResources Storage { get; }
        AnalyticsResources Analytics { get; }
        ApiResources Api { get; }
    }
}