// -----------------------------------------------------------------------
// <copyright file="LightState'.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Clients.Hue
{
    using Newtonsoft.Json;

    /// <summary>
    /// A LightState_ class.
    /// </summary>
    public class LightState
    {
        [JsonProperty("on")]
        public bool? On { get; set; }

        [JsonProperty("bri")]
        public byte? Brightness { get; set; }

        [JsonProperty("sat")]
        public byte? Saturation { get; set; }

        [JsonProperty("hue")]
        public ushort? Hue { get; set; }
    }
}