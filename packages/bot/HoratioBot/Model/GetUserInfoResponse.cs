// -----------------------------------------------------------------------
// <copyright file="GetUserInfoResponse.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Model
{
    /// <summary>
    /// A GetUserInfoResponse class.
    /// </summary>
    public class GetUserInfoResponse
    {
        public string CognitoUsername { get; set; }
        public string TwitchUsername { get; set; }
        public string DiscordUsername { get; set; }
    }
}