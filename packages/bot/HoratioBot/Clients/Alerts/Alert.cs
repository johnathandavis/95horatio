// -----------------------------------------------------------------------
// <copyright file="Alert.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Clients.Alerts
{
    using Newtonsoft.Json;
    using Newtonsoft.Json.Converters;

    /// <summary>
    /// A Alert class.
    /// </summary>
    public class Alert
    {
        private static readonly JsonSerializerSettings SerializerSettings = new JsonSerializerSettings()
        {
            NullValueHandling = NullValueHandling.Ignore
        };

        [JsonConverter(typeof(StringEnumConverter))]
        public AlertType Type { get; set; }
        public SentimentAlert Sentiment { get; set; }

        public string ToJson() => JsonConvert.SerializeObject(this, SerializerSettings);
    }
}