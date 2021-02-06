// -----------------------------------------------------------------------
// <copyright file="IMetricsFactory.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Metrics
{
    /// <summary>
    /// A IMetricsFactory class.
    /// </summary>
    public interface IMetricsFactory
    {
        IMetrics Create();
    }
}