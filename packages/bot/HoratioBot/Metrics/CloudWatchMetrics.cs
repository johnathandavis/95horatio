// -----------------------------------------------------------------------
// <copyright file="CloudWatchMetrics.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Metrics
{
    using System;
    using System.Collections.Generic;
    using System.Threading.Tasks;
    using Amazon.CloudWatch;
    using Amazon.CloudWatch.Model;

    /// <summary>
    /// A CloudWatchMetrics class.
    /// </summary>
    public class CloudWatchMetrics : IMetrics
    {
        private readonly List<Dimension> dimensions;
        private readonly Func<List<MetricDatum>, Task> submitMethod;
        private readonly List<MetricDatum> datapoints;
        private bool isClosed = false;

        public CloudWatchMetrics(Func<List<MetricDatum>, Task> submitMethod)
        {
            this.dimensions = new List<Dimension>();
            this.submitMethod = submitMethod;
            this.datapoints = new List<MetricDatum>();
        }

        public void AddDimension(string name, string val)
        {
            ThrowIfClosed();
            dimensions.Add(new Dimension()
            {
                Name = name,
                Value = val
            });
        }

        public void AddCount(string name, double val) => AddCount(name, val, StandardUnit.Count);
        public void AddCount(string name, double val, StandardUnit unit)
        {
            ThrowIfClosed();
            this.datapoints.Add(new MetricDatum()
            {
                MetricName = name,
                Value = val,
                StorageResolution = 1,
                Unit = unit,
                TimestampUtc = DateTime.UtcNow,
            });
        }

        public void Close()
        {
            foreach (var dp in datapoints)
            {
                dp.Dimensions = new List<Dimension>();
                dp.Dimensions.AddRange(this.dimensions);
            }

            this.submitMethod(datapoints).GetAwaiter().GetResult();
        }

        private void ThrowIfClosed()
        {
            if (this.isClosed)
            {
                throw new InvalidOperationException($"You cannot add datapoints or dimensions to a closed metrics object.");
            }
        }
    }
}