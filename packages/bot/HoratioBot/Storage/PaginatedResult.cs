// -----------------------------------------------------------------------
// <copyright file="PaginatedResult.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Storage
{
    using System.Collections.Generic;

    /// <summary>
    /// A PaginatedResult class.
    /// </summary>
    public class PaginatedResult<T>
    {
        public List<T> Results { get; set; }
        public string PaginationToken { get; set; }
    }
}