// -----------------------------------------------------------------------
// <copyright file="HueExtensions.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Clients.Hue
{
    using System.Drawing;

    /// <summary>
    /// A HueExtensions class.
    /// </summary>
    public static class HueExtensions
    {
        public static LightState ToLightState(this Color color)
        {
            var lightState = new LightState();
            ushort normalizedHue = (ushort) (((double) ushort.MaxValue * (double)color.GetHue()) / 360.0);
            lightState.Hue = normalizedHue;
            lightState.Saturation = (byte) ((double) color.GetSaturation() * (double) byte.MaxValue);
            lightState.Brightness = (byte) ((double) color.GetBrightness() * (double) byte.MaxValue);
            return lightState;
        }
    }
}