// -----------------------------------------------------------------------
// <copyright file="AthenaExtensions.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Storage
{
    using System;
    using Amazon.Athena.Model;

    /// <summary>
    /// A AthenaExtensions class.
    /// </summary>
    public static class AthenaExtensions
    {
        public static double ToDouble(this Datum datum)
        {
            try
            {
                return double.Parse(datum.VarCharValue);
            }
            catch (Exception e)
            {
                return 0.0;
            }
        }
    }
}