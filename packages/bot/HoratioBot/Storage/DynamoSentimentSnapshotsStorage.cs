// -----------------------------------------------------------------------
// <copyright file="DynamoSentimentAnalysisStoragge.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Storage
{
    using System.Collections.Generic;
    using System.Threading.Tasks;
    using Amazon.DynamoDBv2;
    using Amazon.DynamoDBv2.DataModel;

    /// <summary>
    /// A DynamoSentimentAnalysisStorage class.
    /// </summary>
    public class DynamoSentimentSnapshotsStorage : ISentimentSnapshotsStorage
    {
        private readonly DynamoDBContext ddb;
        private readonly DynamoDBOperationConfig config;

        public DynamoSentimentSnapshotsStorage(IAmazonDynamoDB ddb, string tableName)
        {
            this.ddb = new DynamoDBContext(ddb);
            this.config = new DynamoDBOperationConfig()
            {
                OverrideTableName = tableName
            };
        }

        public async Task<List<SentimentSnapshotRow>> GetUserSnapshotsAsync(string cognitoUsername)
        {
            var query = this.ddb.QueryAsync<SentimentSnapshotRow>(cognitoUsername, this.config);
            return await query.GetRemainingAsync();
        }

        public async Task SaveUserSnapshotAsync(SentimentSnapshotRow row) =>
            await this.ddb.SaveAsync(row, this.config);
    }
}