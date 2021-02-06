// -----------------------------------------------------------------------
// <copyright file="TwitchBotWorker.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Services
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading;
    using System.Threading.Tasks;
    using HoratioBot.Clients;
    using HoratioBot.Credentials;
    using HoratioBot.Handlers;
    using HoratioBot.Metrics;
    using HoratioBot.Storage;
    using HoratioBot.Storage.Messages;
    using Microsoft.Extensions.Hosting;
    using Microsoft.Extensions.Logging;
    using Newtonsoft.Json;

    /// <summary>
    /// A TwitchBotWorker class.
    /// </summary>
    public class TwitchBotWorker : BackgroundService
    {
        private readonly ITwitchCredentialsProvider credentialsProvider;
        private readonly ILogger<TwitchBotWorker> logger;
        private readonly IMessageArchiver messageArchiver;
        private readonly IChatMessageStorage chatMessageStorage;
        private readonly IMetricsFactory metricsFactory;
        private readonly Dictionary<string, ITwitchCommandHandler> commandHandlers;

        public TwitchBotWorker(
            ITwitchCredentialsProvider credentialsProvider,
            IEnumerable<ITwitchCommandHandler> handlers,
            IMessageArchiver messageArchiver,
            IChatMessageStorage chatMessageStorage,
            IMetricsFactory metricsFactory,
            ILogger<TwitchBotWorker> logger)
        {
            this.credentialsProvider = credentialsProvider;
            this.commandHandlers = handlers.ToDictionary(
                h => h.CommandName,
                h => h);
            this.messageArchiver = messageArchiver;
            this.chatMessageStorage = chatMessageStorage;
            this.metricsFactory = metricsFactory;
            this.logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var creds = await credentialsProvider.GetCredentialsAsync();
            var bot = new ChatBot(creds.Username, creds.SecretToken, logger);
            bot.ChatMessageReceived += (_, args) =>
            {
                bool success = true;
                var metrics = metricsFactory.Create();
                try
                {
                    metrics.AddDimension("Provider", "Twitch");
                    metrics.AddCount("MessagesReceived", 1.0);
                    var messageJson = JsonConvert.SerializeObject(args);
                    var newMessage = this.chatMessageStorage.PutMessageIfNotDuplicateAsync(new ChatMessageRow()
                    {
                        MessageId = $"twitch:{args.MessageId}",
                        Metadata = messageJson,
                        Sender = args.User,
                        Provider = "twitch",
                        Timestamp = args.Timestamp,
                        MessageContents = args.Message
                    }).Result;
                    metrics.AddCount("SkippingDuplicate", newMessage ? 0.0 : 1.0);
                    if (!newMessage)
                    {
                        return;
                    }

                    logger.LogInformation($"Received message from {args.User}: {args.Message}\n");
                    string msg = args.Message.ToLower();

                    string cmd = msg.Split(' ').FirstOrDefault();
                    bool handlerTriggered = false;
                    if (this.commandHandlers.ContainsKey(cmd))
                    {
                        handlerTriggered = true;
                        this.commandHandlers[cmd].RunCommandAsync(args).GetAwaiter().GetResult();
                    }

                    metrics.AddCount("HandlerTriggered", handlerTriggered ? 1.0 : 0.0);
                    metrics.AddCount("NoHandler", handlerTriggered ? 0.0 : 1.0);
                    this.messageArchiver.ArchiveMessageAsync(new MessageRecord()
                    {
                        Message = msg,
                        Timestamp = args.Timestamp,
                        SourceUsername = args.User,
                        Source = MessageSource.Twitch,
                        SourceMessageId = "twitch:" + args.MessageId
                    });

                }
                catch (Exception ex)
                {
                    logger.LogError("Failed to run message handler.\n" + ex.ToString(), ex);
                    success = false;
                }

                metrics.AddCount("ProcessSuccess", success ? 1.0 : 0.0);
                metrics.AddCount("ProcessSuccess", success ? 0.0 : 1.0);
                metrics.Close();
            };

            await Task.Delay(Timeout.Infinite, stoppingToken);
        }

    }
}