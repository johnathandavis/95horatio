// -----------------------------------------------------------------------
// <copyright file="ITwitchCommandHandler.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Handlers
{
    using System;
    using System.Threading.Tasks;
    using Discord.WebSocket;
    using HoratioBot.Clients;

    public interface ITwitchCommandHandler
    {
        Task RunCommandAsync(ChatBot.MessageEventArgs message);

        string CommandName { get; }
    }
}