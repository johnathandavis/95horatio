// -----------------------------------------------------------------------
// <copyright file="CloudWatchMetricsFactory.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Metrics
{
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using Amazon.CloudWatch;
    using Amazon.CloudWatch.Model;

    /// <summary>
    /// A CloudWatchMetricsFactory class.
    /// </summary>
    public class CloudWatchMetricsFactory : IMetricsFactory
    {
        private readonly IAmazonCloudWatch cloudWatch;
        private readonly string metricNamespace;

        public CloudWatchMetricsFactory(
            IAmazonCloudWatch cloudWatch,
            string metricNamespace)
        {
            this.cloudWatch = cloudWatch;
            this.metricNamespace = metricNamespace;
        }

        public IMetrics Create() => new CloudWatchMetrics(SubmitMetrics);

        private async Task SubmitMetrics(List<MetricDatum> datapoints)
        {
            var batches = datapoints.Partition(25);
            var requests = batches.Select(b => new PutMetricDataRequest()
            {
                Namespace = metricNamespace,
                MetricData = b
            }).Select(req => cloudWatch.PutMetricDataAsync(req));
            await Task.WhenAll(requests);
        }
    }
}