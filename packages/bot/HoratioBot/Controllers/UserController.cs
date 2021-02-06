// -----------------------------------------------------------------------
// <copyright file="UserController.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Controllers
{
    using System.Linq;
    using System.Threading.Tasks;
    using HoratioBot.Model;
    using HoratioBot.Web;
    using Microsoft.AspNetCore.Cors;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.Extensions.Logging;

    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly ILogger<UserController> _logger;

        public UserController(ILogger<UserController> logger)
        {
            _logger = logger;
        }

        [HttpGet]
        [Route("user/whoami")]
        public async Task<GetUserInfoResponse> GetAsync()
        {
            var user = Request.GetRequesterInfo();
            return await Task.FromResult(new GetUserInfoResponse()
            {
                CognitoUsername = user.CognitoUsername,
                TwitchUsername = user.TwitchUsername,
                DiscordUsername = user.DiscordUsername,
            });
        }
    }
}