// -----------------------------------------------------------------------
// <copyright file="KudosStatusTypeConverter.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Storage
{
    using System;
    using Amazon.DynamoDBv2.DataModel;
    using Amazon.DynamoDBv2.DocumentModel;

    /// <summary>
    /// A KudosStatusTypeConverter class.
    /// </summary>
    public class KudosStatusTypeConverter : IPropertyConverter
    {
        public DynamoDBEntry ToEntry(object value)
        {
            if (!(value is KudosStatus)) throw new ArgumentOutOfRangeException();
            KudosStatus kudosStatus = (KudosStatus)value;

            DynamoDBEntry entry = new Primitive
            {
                Value = kudosStatus.ToString()
            };
            return entry;
        }

        public object FromEntry(DynamoDBEntry entry)
        {
            Primitive primitive = entry as Primitive;
            if (primitive == null || !(primitive.Value is String) || string.IsNullOrEmpty((string)primitive.Value))
                throw new ArgumentOutOfRangeException();

            string entryString = entry.AsString();
            foreach (KudosStatus status in Enum.GetValues<KudosStatus>())
            {
                if (status.ToString() == entryString)
                {
                    return status;
                }
            }

            return KudosStatus.Unknown;
        }
    }
}