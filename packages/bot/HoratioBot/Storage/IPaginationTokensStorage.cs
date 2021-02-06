// -----------------------------------------------------------------------
// <copyright file="IPaginationTokensStorage.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Storage
{
    using System.Collections.Generic;
    using System.Threading.Tasks;
    using Amazon.DynamoDBv2.Model;

    public interface IPaginationTokensStorage
    {
        Task<string> SaveNextPageTokenAsync(Dictionary<string, AttributeValue> nextPageToken);
        Task<Dictionary<string, AttributeValue>> GetNextPageTokenAsync(string paginationToken);
    }
}