// -----------------------------------------------------------------------
// <copyright file="KudosController.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Controllers
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using HoratioBot.Model;
    using HoratioBot.Storage;
    using HoratioBot.Web;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.Extensions.Logging;

    [ApiController]
    public class KudosController : ControllerBase
    {
        private readonly IKudosStorageManager kudosStorageManager;
        private readonly ILogger<UserController> logger;

        public KudosController(
            IKudosStorageManager kudosStorageManager,
            ILogger<UserController> logger)
        {
            this.kudosStorageManager = kudosStorageManager;
            this.logger = logger;
        }

        [HttpGet]
        [Route("kudos/sent")]
        public async Task<List<SentKudo>> GetSentKudosAsync()
        {
            var user = Request.GetRequesterInfo();
            var kudos = await this.kudosStorageManager.QueryUserKudosAsync(new KudosQuery()
            {
                TimeAgo = TimeSpan.FromDays(30),
                FromUser = user.DiscordUsername
            });
            return kudos
                .OrderByDescending(k => k.Timestamp)
                .Select(k => new SentKudo()
            {
                Message = k.Message,
                Recipient = k.RecipientUsername,
                Timestamp = k.Timestamp
            }).ToList();
        }

        [HttpGet]
        [Route("kudos/received")]
        public async Task<List<ReceivedKudo>> GetReceivedKudosAsync()
        {
            var user = Request.GetRequesterInfo();
            var kudos = await this.kudosStorageManager.QueryUserKudosAsync(new KudosQuery()
            {
                TimeAgo = TimeSpan.FromDays(30),
                RecipientUser = user.DiscordUsername
            });
            return kudos
                .OrderByDescending(k => k.Timestamp)
                .Select(k => new ReceivedKudo()
            {
                Message = k.Message,
                Timestamp = k.Timestamp
            }).ToList();
        }
    }
}