// -----------------------------------------------------------------------
// <copyright file="FlexibleTimestampConverter.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Storage
{
    using System;
    using Amazon.DynamoDBv2.DataModel;
    using Amazon.DynamoDBv2.DocumentModel;

    /// <summary>
    /// A FlexibleTimestampConverter class.
    /// </summary>
    public class FlexibleTimestampConverter : IPropertyConverter
    {
        public DynamoDBEntry ToEntry(object value)
        {
            DateTime timestamp = (DateTime) value;
            DynamoDBEntry entry = new Primitive
            {
                Value = timestamp.ToString("s", System.Globalization.CultureInfo.InvariantCulture)
            };
            return entry;
        }

        public object FromEntry(DynamoDBEntry entry)
        {
            string dateTimeString = entry.AsString();
            return DateTime.Parse(dateTimeString);
        }
    }
}