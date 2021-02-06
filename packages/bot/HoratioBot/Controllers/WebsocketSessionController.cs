// -----------------------------------------------------------------------
// <copyright file="WebsocketSessionController.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Controllers
{
    using System;
    using System.IO;
    using System.Linq;
    using System.Threading.Tasks;
    using HoratioBot.Model;
    using HoratioBot.Storage;
    using HoratioBot.Web;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.Extensions.Logging;

    /// <summary>
    /// A WebsocketSessionController class.
    /// </summary>
    public class WebsocketSessionController : ControllerBase
    {
        private readonly ISocketSessionStorage socketSessionStorage;
        private readonly ILogger<WebsocketSessionController> logger;

        public WebsocketSessionController(
            ISocketSessionStorage socketSessionStorage,
            ILogger<WebsocketSessionController> logger)
        {
            this.socketSessionStorage = socketSessionStorage;
            this.logger = logger;
        }


        [HttpPut]
        [Route("ws")]
        public async Task<ActionResult> ConnectAsync()
        {
            var user = Request.GetRequesterInfo();
            var connectionId = Request.Headers["X-Websocket-ConnectionId"].First();

            await socketSessionStorage.PutSessionAsync(new SocketSessionRow()
            {
                ConnectedUser = user.CognitoUsername,
                ConnectionId = connectionId,
                ConnectionStartTime = DateTime.UtcNow
            });

            this.logger.LogInformation($"User {user.CognitoUsername} ({user.TwitchUsername}/{user.DiscordUsername}) connected with connection id {connectionId}.");
            return Ok();
        }


        [HttpDelete]
        [Route("ws")]
        public async Task<ActionResult> DisconnectAsync()
        {
            var connectionId = Request.Headers["X-Websocket-ConnectionId"].First();
            var session = await socketSessionStorage.GetSessionByConnectionIdAsync(connectionId);
            this.logger.LogInformation($"Connection id {connectionId} with user {session.ConnectedUser} disconnected.");
            await socketSessionStorage.DeleteSessionByIdAsync(connectionId);
            return Ok();
        }

        [HttpPost]
        [Route("ws")]
        public async Task<ActionResult> MessageAsync()
        {
            var connectionId = Request.Headers["X-Websocket-ConnectionId"].First();
            using var reader = new StreamReader(Request.Body);
            var body = await reader.ReadToEndAsync();
            this.logger.LogInformation($"Connection id {connectionId} posted a message:\n{body}.");
            return Ok();
        }
    }
}