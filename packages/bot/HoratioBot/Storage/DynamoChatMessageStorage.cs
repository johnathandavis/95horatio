// -----------------------------------------------------------------------
// <copyright file="DynamoChatMessageStorage.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Storage
{
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using Amazon.DynamoDBv2;
    using Amazon.DynamoDBv2.DataModel;
    using Amazon.DynamoDBv2.DocumentModel;
    using Amazon.DynamoDBv2.Model;

    /// <summary>
    /// A DynamoChatMessageStorage class.
    /// </summary>
    public class DynamoChatMessageStorage : IChatMessageStorage
    {
        private readonly IPaginationTokensStorage paginationTokensStorage;
        private readonly IAmazonDynamoDB ddb;
        private readonly DynamoDBContext context;
        private readonly DynamoDBOperationConfig config;
        private readonly string tableName;

        public DynamoChatMessageStorage(
            IPaginationTokensStorage paginationTokensStorage,
            IAmazonDynamoDB ddb,
            string tableName)
        {
            this.paginationTokensStorage = paginationTokensStorage;
            this.ddb = ddb;
            this.context = new DynamoDBContext(ddb);
            this.tableName = tableName;
            this.config = new DynamoDBOperationConfig()
            {
                OverrideTableName = tableName
            };
        }

        public async Task<bool> PutMessageIfNotDuplicateAsync(ChatMessageRow row)
        {
            var putReq = new PutItemRequest()
            {
                TableName = this.tableName,
                Item = ToAttributeValueMap(row),
                ConditionExpression = "attribute_not_exists(messageId)",
            };

            try
            {
                await this.ddb.PutItemAsync(putReq);
            }
            catch (ConditionalCheckFailedException cex)
            {
                return false;
            }

            return true;
        }

        public async Task<ChatMessageRow> GetChatMessageRowByIdAsync(string messageId) =>
            await this.context.LoadAsync<ChatMessageRow>(messageId, this.config);

        public async Task UpdateChatMessageAsync(ChatMessageRow row) =>
            await this.context.SaveAsync(row, this.config);

        public async Task<PaginatedResult<ChatMessageRow>> ListChatsBySenderAsync(
            string username,
            bool oldestToNewest,
            string paginationToken = null)
        {
            Dictionary<string, AttributeValue> nextPageToken = null;
            if (!string.IsNullOrWhiteSpace(paginationToken))
            {
                nextPageToken = await this.paginationTokensStorage.GetNextPageTokenAsync(paginationToken);
            }

            var query = new QueryRequest()
            {
                TableName = this.tableName,
                IndexName = "senderIndex",
                ConsistentRead = false,
                ScanIndexForward = oldestToNewest ? true : false,
                Limit = 25,
                KeyConditionExpression = "senderUsername = :username",
                ExpressionAttributeValues = new Dictionary<string, AttributeValue>()
                {
                    {":username", new AttributeValue() {S = username}}
                },
                ExclusiveStartKey = nextPageToken
            };
            var response = await this.ddb.QueryAsync(query);
            var results = new PaginatedResult<ChatMessageRow>()
            {
                Results = response.Items.Select(FromAttributeValueMap).ToList()
            };
            if (response.LastEvaluatedKey != null && response.LastEvaluatedKey.Count > 0)
            {
                results.PaginationToken =
                    await this.paginationTokensStorage.SaveNextPageTokenAsync(response.LastEvaluatedKey);
            }

            return results;
        }

        private Dictionary<string, AttributeValue> ToAttributeValueMap(ChatMessageRow row)
            => this.context.ToDocument(row).ToAttributeMap();

        private ChatMessageRow FromAttributeValueMap(Dictionary<string, AttributeValue> map)
            => this.context.FromDocument<ChatMessageRow>(Document.FromAttributeMap(map));
    }
}