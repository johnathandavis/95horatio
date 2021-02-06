// -----------------------------------------------------------------------
// <copyright file="IMessageArchiver.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Storage.Messages
{
    using System.Threading.Tasks;

    public interface IMessageArchiver
    {
        Task ArchiveMessageAsync(MessageRecord record);
    }
}