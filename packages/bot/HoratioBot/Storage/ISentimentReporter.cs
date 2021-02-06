// -----------------------------------------------------------------------
// <copyright file="ISentimentReporter.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Storage
{
    using System;
    using System.Collections.Generic;
    using System.Threading;
    using System.Threading.Tasks;

    public interface ISentimentReporter
    {
        Task<List<SentimentReportRow>> GenerateSentimentReportAsync(CancellationToken token);
    }
}