// -----------------------------------------------------------------------
// <copyright file="UserIdRow.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Storage
{
    using Amazon.DynamoDBv2.DataModel;

    /// <summary>
    /// A UserIdRow class.
    /// </summary>
    [DynamoDBTable("replaced-at-runtime")]
    public class UserIdRow
    {
        [DynamoDBHashKey("cognitoId")]
        [DynamoDBGlobalSecondaryIndexRangeKey(
            AttributeName = "cognitoId",
            IndexNames = new []
            {
                "twitch2cognito",
                "sub2cognito"
            })]
        public string CognitoUsername { get; set; }

        [DynamoDBRangeKey("twitchUsername")]
        [DynamoDBGlobalSecondaryIndexHashKey(AttributeName = "twitchUsername", IndexNames = new [] { "twitch2cognito"})]
        [DynamoDBGlobalSecondaryIndexRangeKey(AttributeName = "twitchUsername", IndexNames = new [] { "sub2twitch"})]
        public string TwitchUsername { get; set; }

        [DynamoDBGlobalSecondaryIndexHashKey(AttributeName = "sub", IndexNames = new [] { "sub2cognito", "sub2twitch"})]
        public string Sub { get; set; }
    }
}