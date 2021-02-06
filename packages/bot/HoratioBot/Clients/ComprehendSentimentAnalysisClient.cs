// -----------------------------------------------------------------------
// <copyright file="ComprehendSentimentAnalysisClient.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Clients
{
    using System.Threading.Tasks;
    using Amazon.Comprehend;
    using Amazon.Comprehend.Model;
    using Microsoft.Extensions.Logging;

    /// <summary>
    /// A ComprehendSentimentAnalysisClient class.
    /// </summary>
    public class ComprehendSentimentAnalysisClient : ISentimentAnalysisClient
    {
        private readonly IAmazonComprehend comprehend;
        private readonly ILogger<ComprehendSentimentAnalysisClient> logger;

        public ComprehendSentimentAnalysisClient(IAmazonComprehend comprehend,
            ILogger<ComprehendSentimentAnalysisClient> logger)
        {
            this.comprehend = comprehend;
            this.logger = logger;
        }

        public async Task<float> AnalyzePositivityAsync(string message)
        {
            var analyzeRequest = new DetectSentimentRequest()
            {
                LanguageCode = LanguageCode.En,
                Text = message
            };
            var response = await this.comprehend.DetectSentimentAsync(analyzeRequest);
            return response.SentimentScore.Positive;
        }
    }
}