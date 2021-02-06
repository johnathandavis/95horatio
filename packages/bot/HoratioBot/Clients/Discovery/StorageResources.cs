// -----------------------------------------------------------------------
// <copyright file="StorageResources.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Clients.Discovery
{
    /// <summary>
    /// A StorageResources class.
    /// </summary>
    public record StorageResources
    {
        public string KudosTable { get; init; }
        public string LinkRequestsTable { get; init; }
        public string UserIdsTable { get; init; }
        public string CountersTable { get; init; }
        public string ChatMessagesTable { get; init; }
        public string SentimentSnapshotTable { get; init; }
        public string PaginationTokensTable { get; init; }
        public string SocketSessionsTable { get; init; }

    }
}