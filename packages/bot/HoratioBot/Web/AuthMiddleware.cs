// -----------------------------------------------------------------------
// <copyright file="AuthMiddleware.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Web
{
    using System.Linq;
    using System.Threading.Tasks;
    using HoratioBot.Clients;
    using Microsoft.AspNetCore.Builder;
    using Microsoft.AspNetCore.Http;
    using Microsoft.Extensions.Logging;

    /// <summary>
    /// A AuthMiddleware class.
    /// </summary>
    public class AuthMiddleware
    {
        private readonly IUsersClient usersClient;
        private readonly RequestDelegate next;
        private readonly ILogger<AuthMiddleware> logger;

        public AuthMiddleware(
            IUsersClient usersClient,
            RequestDelegate next,
            ILogger<AuthMiddleware> logger)
        {
            this.next = next;
            this.usersClient = usersClient;
            this.logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            if (!context.Request.Headers.ContainsKey("Authorization"))
            {
                await this.next(context);
                return;
            }
            string authHeader = context.Request.Headers["Authorization"].FirstOrDefault();
            var sub = authHeader!.Split(':').LastOrDefault();
            this.logger.LogInformation($"Found auth header: '{authHeader}', extracted sub '{sub}'.");
            var userInfo = await this.usersClient.GetUserInfoAsync(UserReference.FromSub(sub));
            context.Items["user"] = userInfo;
            await this.next(context);
        }
    }

    public static class AuthMiddlewareExtensions
    {
        public static IApplicationBuilder UseAuthInterceptor(
            this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<AuthMiddleware>();
        }

        public static UserInfo GetRequesterInfo(this HttpRequest request) => (UserInfo) request.HttpContext.Items["user"];
    }
}