// -----------------------------------------------------------------------
// <copyright file="SecretManagerDiscordCredentialProvider.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Credentials
{
    using System.Threading.Tasks;
    using Amazon.Runtime.Internal.Util;
    using Amazon.SecretsManager;
    using Amazon.SecretsManager.Model;
    using Microsoft.Extensions.Logging;
    using Newtonsoft.Json;

    /// <summary>
    /// A SecretManagerDiscordCredentialProvider class.
    /// </summary>
    public class SecretManagerDiscordCredentialProvider : IDiscordCredentialProvider
    {
        private readonly ILogger<SecretManagerDiscordCredentialProvider> logger;
        private readonly IAmazonSecretsManager secretsManager;
        private readonly string secretName;

        public SecretManagerDiscordCredentialProvider(
            IAmazonSecretsManager secretsManager,
            string secretName,
            ILogger<SecretManagerDiscordCredentialProvider> logger)
        {
            this.secretsManager = secretsManager;
            this.secretName = secretName;
            this.logger = logger;
        }

        public async Task<DiscordCredentials> GetCredentialsAsync()
        {
            var getRequest = new GetSecretValueRequest()
            {
                SecretId = secretName,
            };
            var getResponse = await this.secretsManager.GetSecretValueAsync(getRequest);
            return JsonConvert.DeserializeObject<DiscordCredentials>(getResponse.SecretString);
        }
    }
}