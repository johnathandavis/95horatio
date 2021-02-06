// -----------------------------------------------------------------------
// <copyright file="DynamoKudosStorageManager.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Storage
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using Amazon.DynamoDBv2;
    using Amazon.DynamoDBv2.DataModel;
    using Amazon.DynamoDBv2.DocumentModel;
    using Microsoft.Extensions.Logging;

    /// <summary>
    /// A DynamoKudosStorageManager class.
    /// </summary>
    public class DynamoKudosStorageManager : IKudosStorageManager
    {
        private readonly DynamoDBContext context;
        private readonly DynamoDBOperationConfig config;
        private readonly ILogger<DynamoKudosStorageManager> logger;

        public DynamoKudosStorageManager(
            IAmazonDynamoDB ddb,
            string tableName,
            ILogger<DynamoKudosStorageManager> logger)
        {
            this.context = new DynamoDBContext(ddb);
            this.config = new DynamoDBOperationConfig()
            {
                OverrideTableName = tableName,
            };
            this.logger = logger;
        }

        public async Task SaveKudoAsync(KudosRecord record)
        {
            record.LastStatusChange = DateTime.Now;
            await this.context.SaveAsync(record, config);
        }

        public async Task<KudosRecord> GetKudoByDiscordMessageId(string discordMessageId)
        {
            var opConfig = new DynamoDBOperationConfig()
            {
                OverrideTableName = this.config.OverrideTableName,
                ConsistentRead = false,
                IndexName = "messageIdIndex"
            };
            var search = this.context.QueryAsync<KudosRecord>(
                discordMessageId,
                opConfig);
            var results = await search.GetRemainingAsync();
            return results.FirstOrDefault();
        }

        public async Task<List<KudosRecord>> QueryUserKudosAsync(KudosQuery query)
        {
            var startTime = DateTime.UtcNow - query.TimeAgo;

            var opConfig = new DynamoDBOperationConfig()
            {
                OverrideTableName = this.config.OverrideTableName,
                ConsistentRead = false
            };
            string username = query.FromUser;
            if (!string.IsNullOrEmpty(query.RecipientUser))
            {
                opConfig.IndexName = "recipientIndex";
                username = query.RecipientUser;
            }

            var search = this.context.QueryAsync<KudosRecord>(
                username,
                QueryOperator.GreaterThan,
                new object[] {startTime},
                opConfig);

            return await search.GetRemainingAsync();
        }
    }
}