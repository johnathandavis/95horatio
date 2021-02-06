// -----------------------------------------------------------------------
// <copyright file="DynamoCountersStorage.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Storage
{
    using System.Threading.Tasks;
    using Amazon.DynamoDBv2;
    using Amazon.DynamoDBv2.DataModel;
    using Amazon.DynamoDBv2.Model;

    /// <summary>
    /// A DynamoCountersStorage class.
    /// </summary>
    public class DynamoCountersStorage : ICountersStorage
    {
        private readonly IAmazonDynamoDB ddb;
        private readonly string tableName;

        public DynamoCountersStorage(IAmazonDynamoDB ddb, string tableName)
        {
            this.ddb = ddb;
        }

        public async Task GetMsgCountsAsync(string username)
        {

        }

        public async Task IncrementTwitchMsgCountAsync(string username) =>
            await IncrementDiscordMsgCountAsync("twitch", username);

        public async Task IncrementDiscordMsgCountAsync(string username) =>
            await IncrementDiscordMsgCountAsync("discord", username);

        private async Task IncrementDiscordMsgCountAsync(string service, string username)
        {
        }
    }
}