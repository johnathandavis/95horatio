// -----------------------------------------------------------------------
// <copyright file="AnalyticsResources.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Clients.Discovery
{
    /// <summary>
    /// A AnalyticsResources class.
    /// </summary>
    public record AnalyticsResources
    {
        public string ChatStreamName { get; init; }
        public string SentimentReportWorkgroup { get; init; }
        public string SentimentReportJobQueueUrl { get; init; }
    }
}