// -----------------------------------------------------------------------
// <copyright file="DynamoSocketSessionStorage.cs" company="ChessDB.AI">
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
    /// A DynamoSocketSessionStorage class.
    /// </summary>
    public class DynamoSocketSessionStorage : ISocketSessionStorage
    {
        private readonly DynamoDBContext ddb;
        private readonly DynamoDBOperationConfig config;

        public DynamoSocketSessionStorage(IAmazonDynamoDB ddb, string tableName)
        {
            this.ddb = new DynamoDBContext(ddb);
            this.config = new DynamoDBOperationConfig()
            {
                OverrideTableName = tableName
            };
        }


        public async Task PutSessionAsync(SocketSessionRow row) =>
            await this.ddb.SaveAsync(row, this.config);

        public async Task DeleteSessionByIdAsync(string connectionId) =>
            await this.ddb.DeleteAsync<SocketSessionRow>(connectionId, this.config);

        public async Task<SocketSessionRow> GetSessionByConnectionIdAsync(string connectionId) =>
            await this.ddb.LoadAsync<SocketSessionRow>(connectionId, this.config);

        public async Task<List<SocketSessionRow>> ListSessionsByUserAsync(string user)
        {
            var query = this.ddb.QueryAsync<SocketSessionRow>(user, new DynamoDBOperationConfig()
            {
                OverrideTableName = this.config.OverrideTableName,
                IndexName = "userIndex"
            });
            return await query.GetRemainingAsync();
        }

        public async Task<List<SocketSessionRow>> ListAllSessionsAsync()
        {
            var scan = this.ddb.ScanAsync<SocketSessionRow>(new List<ScanCondition>(), this.config);
            return await scan.GetRemainingAsync();
        }
    }
}