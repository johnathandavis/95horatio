// -----------------------------------------------------------------------
// <copyright file="ICommandHandler.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Handlers
{
    using System.Threading.Tasks;
    using Discord.WebSocket;

    public interface IDiscordCommandHandler
    {
        Task RunCommandAsync(SocketMessage message, DiscordSocketClient client);

        string CommandName { get; }
    }
}