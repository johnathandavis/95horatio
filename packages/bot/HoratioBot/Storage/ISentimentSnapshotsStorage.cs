// -----------------------------------------------------------------------
// <copyright file="ISentimentSnapshotsStorage.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Storage
{
    using System.Collections.Generic;
    using System.Threading.Tasks;

    public interface ISentimentSnapshotsStorage
    {
        Task<List<SentimentSnapshotRow>> GetUserSnapshotsAsync(string cognitoUsername);
        Task SaveUserSnapshotAsync(SentimentSnapshotRow row);
    }
}