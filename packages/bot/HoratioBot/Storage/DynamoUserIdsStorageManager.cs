// -----------------------------------------------------------------------
// <copyright file="DynamoUserIdsStorageManager.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Storage
{
    using System.Linq;
    using System.Threading.Tasks;
    using Amazon.DynamoDBv2;
    using Amazon.DynamoDBv2.DataModel;
    using TwitchLib.Api.V5.Models.Users;

    /// <summary>
    /// A DynamoUserIdsStorageManager class.
    /// </summary>
    public class DynamoUserIdsStorageManager : IUserIdsStorageManager
    {
        private readonly DynamoDBContext context;
        private readonly DynamoDBOperationConfig config;

        public DynamoUserIdsStorageManager(IAmazonDynamoDB ddb, string tableName)
        {
            this.context = new DynamoDBContext(ddb);
            this.config = new DynamoDBOperationConfig()
            {
                OverrideTableName = tableName
            };
        }

        public async Task<UserIdRow> GetUserIdsFromCognitoAsync(string cognitoId)
        {
            var row = await this.context.LoadAsync<UserIdRow>(cognitoId, config);
            if (row == null)
            {
                throw new UserIdNotFoundException($"No user found with cognito id = '{cognitoId}'.");
            }

            return row;
        }

        public async Task<UserIdRow> GetUserIdsFromTwitchAsync(string twitchId)
        {
            var opConfig = new DynamoDBOperationConfig()
            {
                OverrideTableName = this.config.OverrideTableName,
                IndexName = "twitch2cognito"
            };
            var query = this.context.QueryAsync<UserIdRow>(twitchId, opConfig);
            var rows = await query.GetRemainingAsync();
            var result = rows.FirstOrDefault();
            if (result == null)
            {
                throw new UserIdNotFoundException($"No user found with twitch id = '{twitchId}'.");
            }

            return result;
        }

        public async Task<UserIdRow> GetUserIdsFromSubAsync(string sub)
        {
            var opConfig = new DynamoDBOperationConfig()
            {
                OverrideTableName = this.config.OverrideTableName,
                IndexName = "sub2cognito"
            };
            var query = this.context.QueryAsync<UserIdRow>(sub, opConfig);
            var rows = await query.GetRemainingAsync();
            return rows.FirstOrDefault();
        }
    }
}