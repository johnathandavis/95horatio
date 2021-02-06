// -----------------------------------------------------------------------
// <copyright file="UserReference.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Clients
{
    /// <summary>
    /// A UserReference class.
    /// </summary>
    public class UserReference
    {
        public string Sub { get; set; }
        public string CognitoUsername { get; set; }
        public string TwitchUsername { get; set; }

        public static UserReference FromCognito(string cognito) => new UserReference()
        {
            CognitoUsername = cognito
        };

        public static UserReference FromSub(string sub) => new UserReference()
        {
            Sub = sub
        };

        public static UserReference FromTwitch(string twitch) => new UserReference()
        {
            TwitchUsername = twitch
        };
    }
}