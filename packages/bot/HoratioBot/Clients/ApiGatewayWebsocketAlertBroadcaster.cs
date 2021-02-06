// -----------------------------------------------------------------------
// <copyright file="ApiGatewayWebsocketAlertBroadcaster.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Clients
{
    using System;
    using System.IO;
    using System.Linq;
    using System.Text;
    using System.Threading.Tasks;
    using Amazon.ApiGatewayManagementApi;
    using Amazon.ApiGatewayManagementApi.Model;
    using HoratioBot.Clients.Alerts;
    using HoratioBot.Storage;
    using Microsoft.Extensions.Logging;

    /// <summary>
    /// A ApiGatewayWebsocketAlertBroadcaster class.
    /// </summary>
    public class ApiGatewayWebsocketAlertBroadcaster : IAlertBroadcaster
    {
        private readonly IAmazonApiGatewayManagementApi apiGatewayManagementApi;
        private readonly ISocketSessionStorage socketSessionStorage;
        private readonly ILogger<ApiGatewayWebsocketAlertBroadcaster> logger;

        public ApiGatewayWebsocketAlertBroadcaster(
            IAmazonApiGatewayManagementApi api,
            ISocketSessionStorage socketSessionStorage,
            ILogger<ApiGatewayWebsocketAlertBroadcaster> logger)
        {
            this.apiGatewayManagementApi = api;
            this.socketSessionStorage = socketSessionStorage;
            this.logger = logger;
        }

        public async Task BroadcastAsync(Alert alert)
        {
            var alertBytes = Encoding.UTF8.GetBytes(alert.ToJson());
            using var ms = new MemoryStream(alertBytes);

            var allSessions = await this.socketSessionStorage.ListAllSessionsAsync();

            try
            {
                var tasks = allSessions
                    .Select(session => this.apiGatewayManagementApi.PostToConnectionAsync(new PostToConnectionRequest()
                    {
                        Data = new MemoryStream(alertBytes),
                        ConnectionId = session.ConnectionId,
                    })).ToList();

                await Task.WhenAll(tasks);
            }
            catch (Exception ex)
            {
                this.logger.LogError($"Failed to broadcast message:\n{ex}", ex);
            }
        }
    }
}