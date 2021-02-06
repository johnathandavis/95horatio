// -----------------------------------------------------------------------
// <copyright file="CloudMapResourceDiscoverer.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Clients.Discovery
{
    using System;
    using System.Threading.Tasks;
    using Amazon.ServiceDiscovery;
    using Amazon.ServiceDiscovery.Model;
    using Newtonsoft.Json;

    /// <summary>
    /// A CloudMapResourceDiscoverer class.
    /// </summary>
    public class CloudMapResourceDiscoverer : IResourceDiscoverer
    {
        private readonly Lazy<AuthResources> authLazy;
        private readonly Lazy<StorageResources> storageLazy;
        private readonly Lazy<AnalyticsResources> analyticsLazy;
        private readonly Lazy<ApiResources> apiLazy;

        public CloudMapResourceDiscoverer(IAmazonServiceDiscovery serviceDiscovery, string serviceId)
        {
            this.authLazy = new Lazy<AuthResources>(() =>
                DiscoverAuthResourcesAsync(serviceDiscovery, serviceId).GetAwaiter().GetResult());
            this.storageLazy = new Lazy<StorageResources>(() =>
                DiscoverStorageResourcesAsync(serviceDiscovery, serviceId).GetAwaiter().GetResult());
            this.analyticsLazy = new Lazy<AnalyticsResources>(() =>
                DiscoverAnalyticsResourcesAsync(serviceDiscovery, serviceId).GetAwaiter().GetResult());
            this.apiLazy = new Lazy<ApiResources>(() =>
                DiscoverApiResourcesAsync(serviceDiscovery, serviceId).GetAwaiter().GetResult());
        }

        public AuthResources Auth => authLazy.Value;
        public StorageResources Storage => storageLazy.Value;
        public AnalyticsResources Analytics => analyticsLazy.Value;
        public ApiResources Api => apiLazy.Value;

        private static async Task<StorageResources> DiscoverStorageResourcesAsync(IAmazonServiceDiscovery discovery, string serviceId)
        {
            GetInstanceResponse resourcesResponse;
            try
            {
                resourcesResponse = await discovery.GetInstanceAsync(new GetInstanceRequest()
                {
                    ServiceId = serviceId,
                    InstanceId = "storageTables",
                });
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                throw;
            }

            var attributes = resourcesResponse.Instance.Attributes;

            var storage = new StorageResources()
            {
                CountersTable = attributes["counters"],
                KudosTable = attributes["kudos"],
                LinkRequestsTable = attributes["linkrequests"],
                UserIdsTable = attributes["userids"],
                ChatMessagesTable = attributes["chatmessages"],
                SentimentSnapshotTable = attributes["sentimentsnapshots"],
                PaginationTokensTable = attributes["paginationtokens"],
                SocketSessionsTable = attributes["socketsessions"]
            };
            return storage;
        }

        private static async Task<AnalyticsResources> DiscoverAnalyticsResourcesAsync(IAmazonServiceDiscovery discovery,
            string serviceId)
        {
            GetInstanceResponse resourcesResponse;
            try
            {
                resourcesResponse = await discovery.GetInstanceAsync(new GetInstanceRequest()
                {
                    ServiceId = serviceId,
                    InstanceId = "analytics",
                });
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                throw;
            }

            var attributes = resourcesResponse.Instance.Attributes;

            var storage = new AnalyticsResources()
            {
                ChatStreamName = attributes["chatstream"],
                SentimentReportWorkgroup = attributes["sentimentreportworkgroup"],
                SentimentReportJobQueueUrl = attributes["sentimentreportqueue"]
            };
            return storage;
        }

        private static async Task<ApiResources> DiscoverApiResourcesAsync(IAmazonServiceDiscovery discovery,
            string serviceId)
        {
            GetInstanceResponse resourcesResponse;
            try
            {
                resourcesResponse = await discovery.GetInstanceAsync(new GetInstanceRequest()
                {
                    ServiceId = serviceId,
                    InstanceId = "api",
                });
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                throw;
            }

            var attributes = resourcesResponse.Instance.Attributes;

            var storage = new ApiResources()
            {
                WebsocketApiId = attributes["websocketApiId"],
            };
            return storage;
        }

        private static async Task<AuthResources> DiscoverAuthResourcesAsync(IAmazonServiceDiscovery discovery, string serviceId)
        {
            GetInstanceResponse resourcesResponse;
            try
            {
                resourcesResponse = await discovery.GetInstanceAsync(new GetInstanceRequest()
                {
                    ServiceId = serviceId,
                    InstanceId = "auth",
                });
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                throw;
            }

            var attributes = resourcesResponse.Instance.Attributes;
            return new AuthResources()
            {
                UserPoolId = attributes["userpoolid"]
            };
        }
    }
}