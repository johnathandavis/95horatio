// -----------------------------------------------------------------------
// <copyright file="ListChatsResponse.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Model
{
    using System.Collections.Generic;

    /// <summary>
    /// A ListChatsResponse class.
    /// </summary>
    public class ListChatsResponse
    {
        public string PaginationToken { get; set; }
        public List<ChatMessage> Messages { get; set; }
    }
}