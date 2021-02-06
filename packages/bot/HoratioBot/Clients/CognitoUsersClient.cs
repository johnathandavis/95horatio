// -----------------------------------------------------------------------
// <copyright file="CognitoUsersClient.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Clients
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using Amazon.CognitoIdentityProvider;
    using Amazon.CognitoIdentityProvider.Model;
    using HoratioBot.Storage;

    /// <summary>
    /// A CognitoUsersClient class.
    /// </summary>
    public class CognitoUsersClient : IUsersClient
    {
        private readonly IUserIdsStorageManager userIdsStorage;
        private readonly IAmazonCognitoIdentityProvider cognito;
        private readonly string userPoolId;

        public CognitoUsersClient(
            IAmazonCognitoIdentityProvider cognito,
            IUserIdsStorageManager userIdsStorage,
            string userPoolId)
        {
            this.userIdsStorage = userIdsStorage;
            this.cognito = cognito;
            this.userPoolId = userPoolId;
        }

        public async Task SetDiscordUserAsync(UserReference userReference, string discordUsername)
        {
            var cognitoUser = await ResolveUserRefAsync(userReference);

            await this.cognito.AdminUpdateUserAttributesAsync(new AdminUpdateUserAttributesRequest()
            {
                UserPoolId = this.userPoolId,
                Username = cognitoUser,
                UserAttributes = new List<AttributeType>(new []
                {
                    new AttributeType()
                    {
                        Name = "custom:discord_username",
                        Value = discordUsername,
                    }
                })
            });
        }

        public async Task<UserInfo> GetUserInfoAsync(UserReference userReference)
        {
            var cognitoId = await ResolveUserRefAsync(userReference);
            var response = await this.cognito.AdminGetUserAsync(new AdminGetUserRequest()
            {
                UserPoolId = this.userPoolId,
                Username = cognitoId
            });
            var twitchUsername = response.UserAttributes
                .First(att => att.Name == "custom:twitch_username")
                .Value;
            var discordUsername = response.UserAttributes
                .FirstOrDefault(att => att.Name == "custom:discord_username")?.Value;
            return new UserInfo()
            {
                TwitchUsername = twitchUsername,
                DiscordUsername = discordUsername,
                CognitoUsername = cognitoId,
            };
        }

        private async Task<string> ResolveUserRefAsync(UserReference userReference)
        {
            string cognitoId = null;
            if (!string.IsNullOrEmpty(userReference.CognitoUsername))
            {
                cognitoId = userReference.CognitoUsername;
            }
            else if (!string.IsNullOrEmpty(userReference.TwitchUsername))
            {
                var row = await this.userIdsStorage.GetUserIdsFromTwitchAsync(userReference.TwitchUsername);
                cognitoId = row?.CognitoUsername;
            }
            else if (!string.IsNullOrEmpty(userReference.Sub))
            {
                var row = await this.userIdsStorage.GetUserIdsFromSubAsync(userReference.Sub);
                cognitoId = row?.CognitoUsername;
            }

            if (cognitoId == null)
            {
                throw new ArgumentException($"No Cognito username replied, and no cognito id found for twitch user.");
            }

            return cognitoId;
        }
    }
}