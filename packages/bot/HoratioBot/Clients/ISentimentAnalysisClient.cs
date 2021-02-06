// -----------------------------------------------------------------------
// <copyright file="ISentimentAnalysisClient.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Clients
{
    using System.Threading.Tasks;

    /// <summary>
    /// A ISentimentAnalysisClient class.
    /// </summary>
    public interface ISentimentAnalysisClient
    {
        Task<float> AnalyzePositivityAsync(string message);
    }
}