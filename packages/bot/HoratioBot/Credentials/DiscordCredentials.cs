// -----------------------------------------------------------------------
// <copyright file="DiscordCredentials.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Credentials
{
    using Newtonsoft.Json;

    /// <summary>
    /// A DiscordCredentials class.
    /// </summary>
    public class DiscordCredentials
    {
        [JsonProperty("token")]
        public string AppToken { get; set; }
    }
}