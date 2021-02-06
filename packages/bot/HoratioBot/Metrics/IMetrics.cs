// -----------------------------------------------------------------------
// <copyright file="IMetrics.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Metrics
{
    using Amazon.CloudWatch;

    /// <summary>
    /// A IMetrics class.
    /// </summary>
    public interface IMetrics
    {
        void AddDimension(string name, string val);
        void AddCount(string name, double val);
        void AddCount(string name, double val, StandardUnit unit);


        void Close();
    }
}