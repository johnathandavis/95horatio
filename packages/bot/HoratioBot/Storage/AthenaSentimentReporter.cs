// -----------------------------------------------------------------------
// <copyright file="AthenaSentimentReporter.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Storage
{
    using System;
    using System.Collections.Generic;
    using System.IO;
    using System.Linq;
    using System.Threading;
    using System.Threading.Tasks;
    using Amazon.Athena;
    using Amazon.Athena.Model;
    using HoratioBot.Clients.Discovery;
    using Microsoft.Extensions.Logging;

    /// <summary>
    /// A AthenaSentimentReporter class.
    /// </summary>
    public class AthenaSentimentReporter : ISentimentReporter
    {
        private readonly IAmazonAthena athena;
        private readonly string workgroup;
        private readonly string database;
        private readonly string table;
        private readonly ILogger<AthenaSentimentReporter> logger;

        public AthenaSentimentReporter(
            IAmazonAthena athena,
            string database,
            string table,
            AnalyticsResources analyticsResources,
            ILogger<AthenaSentimentReporter> logger)
        {
            this.athena = athena;
            this.workgroup = analyticsResources.SentimentReportWorkgroup;
            this.database = database;
            this.table = table;
            this.logger = logger;
        }

        public async Task<List<SentimentReportRow>> GenerateSentimentReportAsync(CancellationToken token)
        {
            var req = new StartQueryExecutionRequest()
            {
                QueryExecutionContext = new QueryExecutionContext()
                {
                    Catalog = "AwsDataCatalog",
                    Database = this.database
                },
                QueryString = CreateQueryForTableName(this.database, this.table),
                WorkGroup = this.workgroup
            };

            var response = await this.athena.StartQueryExecutionAsync(req, token);
            string queryId = response.QueryExecutionId;
            this.logger.LogInformation($"Started query execution with id {queryId}.");

            GetQueryExecutionResponse executionResponse;
            while (true)
            {
                await Task.Delay(TimeSpan.FromSeconds(3), token);

                executionResponse = await this.athena.GetQueryExecutionAsync(new GetQueryExecutionRequest()
                {
                    QueryExecutionId = queryId
                }, token);

                if (executionResponse.QueryExecution.Status.State == QueryExecutionState.RUNNING)
                {
                    continue;
                }

                break;
            }

            if (executionResponse.QueryExecution.Status.State == QueryExecutionState.FAILED)
            {
                this.logger.LogError(executionResponse.QueryExecution.Status.StateChangeReason);
                throw new Exception(
                    $"Athena query failed because: {executionResponse.QueryExecution.Status.StateChangeReason}");
            }

            var resultsResponse = await this.athena.GetQueryResultsAsync(new GetQueryResultsRequest()
            {
                QueryExecutionId = queryId,
                MaxResults = 1000
            }, token);
            var results = resultsResponse.ResultSet.Rows;
            return results.Skip(1).Select(
                    r => new SentimentReportRow()
                    {
                        Username = r.Data[0].VarCharValue,
                        NumberOfMessages = int.Parse(r.Data[1].VarCharValue),
                        Positivity = r.Data[2].ToDouble(),
                        Negativity = r.Data[3].ToDouble(),
                        Neutrality = r.Data[4].ToDouble(),
                        Mixed = r.Data[5].ToDouble(),
                    })
                .ToList();
        }

        private static string CreateQueryForTableName(string database, string tableName)
        {
            using var stream =
                typeof(AthenaSentimentReporter).Assembly.GetManifestResourceStream(
                    "HoratioBot.Storage.ReportQuery.sql");
            using var reader = new StreamReader(stream);
            string query = reader.ReadToEnd();
            return query
                .Replace("%tablename%", tableName)
                .Replace("%database%", database);
        }
    }
}