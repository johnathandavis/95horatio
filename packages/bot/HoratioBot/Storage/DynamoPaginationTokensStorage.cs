// -----------------------------------------------------------------------
// <copyright file="DynamoPaginationTokensStorage.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Storage
{
    using System;
    using System.Collections.Generic;
    using System.Threading.Tasks;
    using Amazon.DynamoDBv2;
    using Amazon.DynamoDBv2.DataModel;
    using Amazon.DynamoDBv2.Model;
    using Newtonsoft.Json;

    /// <summary>
    /// A DynamoPaginationTokensStorage class.
    /// </summary>
    public class DynamoPaginationTokensStorage : IPaginationTokensStorage
    {
        private static readonly JsonSerializerSettings SerializerSettings = new JsonSerializerSettings()
        {
            NullValueHandling = NullValueHandling.Ignore
        };

        private readonly DynamoDBContext ddb;
        private readonly DynamoDBOperationConfig config;

        public DynamoPaginationTokensStorage(IAmazonDynamoDB ddb, string tableName)
        {
            this.ddb = new DynamoDBContext(ddb);
            this.config = new DynamoDBOperationConfig()
            {
                OverrideTableName = tableName
            };
        }

        public async Task<string> SaveNextPageTokenAsync(Dictionary<string, AttributeValue> nextPageToken)
        {
            var record = new PaginationRecord()
            {
                Token = Guid.NewGuid().ToString(),
                NextItemMapJson = JsonConvert.SerializeObject(nextPageToken, SerializerSettings),
                ExpirationTimestampSeconds = new DateTimeOffset(DateTime.UtcNow + TimeSpan.FromDays(1)).ToUnixTimeSeconds()
            };
            await this.ddb.SaveAsync(record, this.config);
            return record.Token;
        }

        public async Task<Dictionary<string, AttributeValue>> GetNextPageTokenAsync(string paginationToken)
        {
            var record = await this.ddb.LoadAsync<PaginationRecord>(paginationToken, this.config);
            return JsonConvert.DeserializeObject<Dictionary<string, AttributeValue>>(record.NextItemMapJson, SerializerSettings);
        }
    }
}