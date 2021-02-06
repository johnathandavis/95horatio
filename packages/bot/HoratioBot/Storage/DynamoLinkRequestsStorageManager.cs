// -----------------------------------------------------------------------
// <copyright file="DynamoLinkRequestsStorageManager.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Storage
{
    using System.Linq;
    using System.Threading;
    using System.Threading.Tasks;
    using Amazon.DynamoDBv2;
    using Amazon.DynamoDBv2.DataModel;

    /// <summary>
    /// A DynamoLinkRequestsStorageManager class.
    /// </summary>
    public class DynamoLinkRequestsStorageManager : ILinkRequestsStorageManager
    {
        private readonly DynamoDBContext context;
        private readonly DynamoDBOperationConfig config;

        public DynamoLinkRequestsStorageManager(IAmazonDynamoDB ddb, string tableName)
        {
            this.context = new DynamoDBContext(ddb);
            this.config = new DynamoDBOperationConfig()
            {
                OverrideTableName = tableName
            };
        }

        public async Task<LinkRequest> GetLinkRequestForDiscordUserAsync(string discordUsername)
        {
            var query = this.context.QueryAsync<LinkRequest>(discordUsername, new DynamoDBOperationConfig()
            {
                OverrideTableName = this.config.OverrideTableName,
                IndexName = "discord2twitchIndex"
            });
            var results = await query.GetRemainingAsync();
            return results.FirstOrDefault();
        }

        public async Task SaveLinkRequestAsync(LinkRequest request)
        {
            await this.context.SaveAsync<LinkRequest>(request, this.config);
        }

        public async Task DeleteLinkRequestAsync(LinkRequest request)
        {
            await this.context.DeleteAsync<LinkRequest>(
                request.TwitchUsername,
                request.DiscordUsername,
                this.config,
                CancellationToken.None);
        }
    }
}