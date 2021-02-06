// -----------------------------------------------------------------------
// <copyright file="SentimentReportRow.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Storage
{
    /// <summary>
    /// A SentimentReportRow class.
    /// </summary>
    public class SentimentReportRow
    {
        public string Username { get; set; }
        public int NumberOfMessages { get; set; }
        public double Positivity { get; set; }
        public double Negativity { get; set; }
        public double Neutrality { get; set; }
        public double Mixed { get; set; }
    }
}