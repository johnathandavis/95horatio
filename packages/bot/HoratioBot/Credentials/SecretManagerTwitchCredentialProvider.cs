// -----------------------------------------------------------------------
// <copyright file="SecretManagerTwitchCredentialProvider.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Credentials
{
    using System.Threading.Tasks;
    using Amazon.SecretsManager;
    using Amazon.SecretsManager.Model;
    using Microsoft.Extensions.Logging;
    using Newtonsoft.Json;

    /// <summary>
    /// A SecretManagerTwitchCredentialProvider class.
    /// </summary>
    public class SecretManagerTwitchCredentialProvider : ITwitchCredentialsProvider
    {
        private readonly ILogger<SecretManagerTwitchCredentialProvider> logger;
        private readonly IAmazonSecretsManager secretsManager;
        private readonly string secretName;

        public SecretManagerTwitchCredentialProvider(
            IAmazonSecretsManager secretsManager,
            string secretName,
            ILogger<SecretManagerTwitchCredentialProvider> logger)
        {
            this.secretsManager = secretsManager;
            this.secretName = secretName;
            this.logger = logger;
        }

        public async Task<TwitchCredentials> GetCredentialsAsync()
        {
            var getRequest = new GetSecretValueRequest()
            {
                SecretId = secretName,
            };
            var getResponse = await this.secretsManager.GetSecretValueAsync(getRequest);
            return JsonConvert.DeserializeObject<TwitchCredentials>(getResponse.SecretString);
        }
    }
}