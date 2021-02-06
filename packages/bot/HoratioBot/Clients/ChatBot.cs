// -----------------------------------------------------------------------
// <copyright file="ChatBot.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Clients
{
    using System;
    using Microsoft.Extensions.Logging;
    using TwitchLib.Client;
    using TwitchLib.Client.Events;
    using TwitchLib.Client.Models;
    using TwitchLib.Communication.Clients;
    using TwitchLib.Communication.Events;
    using TwitchLib.Communication.Models;

    /// <summary>
    /// A ChatBot class.
    /// </summary>
    public class ChatBot
    {
        public delegate void ChatMessageEventHandler(object sender, MessageEventArgs e);

        public event ChatMessageEventHandler ChatMessageReceived;

        TwitchClient client;

        public ChatBot(string clientId, string secret, ILogger logger)
        {
            ConnectionCredentials credentials = new ConnectionCredentials(clientId, secret);
	        var clientOptions = new ClientOptions
                {
                    MessagesAllowedInPeriod = 750,
                    ThrottlingPeriod = TimeSpan.FromSeconds(30)
                };
            WebSocketClient customClient = new WebSocketClient(clientOptions);
            client = new TwitchClient(customClient);
            client.Initialize(credentials, "95horatio");
            logger.LogInformation("Initialized twitch chat client.");

            client.OnMessageReceived += Client_OnMessageReceived;
            client.OnDisconnected += (sender, args) => ClientOnOnDisconnected(args, logger);
            client.OnConnected += (sender, args) =>
            {
                logger.LogInformation($"Connected to channel.");
            };
            client.OnConnectionError += (sender, args) =>
            {
                logger.LogError($"Failed to connect! {args.Error.Message}");
            };
            client.Connect();
        }

        private void ClientOnOnDisconnected(OnDisconnectedEventArgs e, ILogger logger)
        {
            logger.LogError("Disconnected from channel.");
            try
            {
                this.client.Connect();
                logger.LogInformation($"Reconnected to channel.");
            }
            catch (Exception exception)
            {
                logger.LogError("Failed to reconnect to channel.");
            }
        }

        private void Client_OnMessageReceived(object sender, OnMessageReceivedArgs e)
        {
            Action<string> replyAction = (msg) =>
            {
                client.SendMessage(e.ChatMessage.Channel, $"@{e.ChatMessage.DisplayName} {msg}");
            };
            var args = new MessageEventArgs(replyAction)
            {
                User = e.ChatMessage.DisplayName,
                Message = e.ChatMessage.Message,
                Timestamp = DateTime.Now,
                MessageId = e.ChatMessage.Id
            };

            ChatMessageReceived?.Invoke(this, args);
        }

        public class MessageEventArgs
        {
            private readonly Action<string> replyAction;

            public MessageEventArgs(Action<string> replyAction)
            {
                this.replyAction = replyAction;
            }

            public DateTime Timestamp { get; set; }
            public string User { get; set; }
            public string Message { get; set; }
            public string MessageId { get; set; }

            public void Reply(string message) => replyAction(message);
        }

    }
}