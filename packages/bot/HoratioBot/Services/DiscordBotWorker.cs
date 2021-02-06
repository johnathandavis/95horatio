using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace HoratioBot.Services
{
    using System.Collections.Generic;
    using System.Linq;
    using Discord;
    using Discord.WebSocket;
    using HoratioBot.Credentials;
    using HoratioBot.Handlers;
    using HoratioBot.Metrics;
    using HoratioBot.Storage;
    using HoratioBot.Storage.Messages;
    using MessageSource = HoratioBot.Storage.Messages.MessageSource;

    public class DiscordBotWorker : BackgroundService
    {
        private readonly ILogger<DiscordBotWorker> logger;
        private readonly IDiscordCredentialProvider credentialProvider;
        private readonly DiscordSocketClient socketClient;
        private readonly IMessageArchiver messageArchiver;
        private readonly IChatMessageStorage chatMessageStorage;
        private readonly IMetricsFactory metricsFactory;
        private readonly Dictionary<string, IDiscordCommandHandler> commandHandlers;
        private const ulong ServerId = 799375962998833152;
        private const ulong ChannelId = 799395846915489822;

        public DiscordBotWorker(
            DiscordSocketClient discordSocketClient,
            IDiscordCredentialProvider credentialProvider,
            IEnumerable<IDiscordCommandHandler> commandHandlers,
            IMessageArchiver messageArchiver,
            IChatMessageStorage chatMessageStorage,
            IMetricsFactory metricsFactory,
            ILogger<DiscordBotWorker> logger)
        {
            this.credentialProvider = credentialProvider;
            this.commandHandlers = commandHandlers
                .ToDictionary(
                    ch => ch.CommandName,
                    ch => ch);
            this.socketClient = discordSocketClient;
            this.socketClient.Log += WebhookClientOnLog;
            this.socketClient.Ready += WebhookClientOnReady;
            this.socketClient.MessageReceived += WebhookClientOnMessageReceived;
            this.messageArchiver = messageArchiver;
            this.chatMessageStorage = chatMessageStorage;
            this.metricsFactory = metricsFactory;
            this.logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var token = await this.credentialProvider.GetCredentialsAsync();
            this.logger.LogInformation($"Logging in to Discord...");
            await this.socketClient.LoginAsync(TokenType.Bot, token.AppToken);
            this.logger.LogInformation($"Discord login completed...");
            await this.socketClient.StartAsync();
            this.logger.LogInformation($"Discord socket client started...");

            await Task.Delay(Timeout.Infinite, stoppingToken);

            try
            {
                this.socketClient.Dispose();
            }
            catch (Exception e)
            {
                this.logger.LogWarning($"Failed to dispose Discord socket client.\n{e}");
            }
        }

        private async Task WebhookClientOnMessageReceived(SocketMessage message)
        {
            // The bot should never respond to itself.
            if (message.Author.Id == this.socketClient.CurrentUser.Id)
            {
                return;
            }

            var metrics = this.metricsFactory.Create();
            metrics.AddDimension("Provider", "Discord");
            metrics.AddCount("MessagesReceived", 1.0);

            string command = message.Content.Split(' ').First().ToLower();
            bool handlerTriggered = false;
            bool success = true;
            if (command.StartsWith("!") && this.commandHandlers.ContainsKey(command))
            {
                handlerTriggered = true;
                var commandHandler = this.commandHandlers[command];
                await commandHandler.RunCommandAsync(message, this.socketClient);

                try
                {
                    await this.messageArchiver.ArchiveMessageAsync(new DiscordMessageRecord()
                    {
                        ServerId = message.Reference.GuildId.GetValueOrDefault(0L).ToString(),
                        ChannelId = message.Channel.Id.ToString(),
                        Source = MessageSource.Discord,
                        SourceUsername = message.Author.Username + "#" + message.Author.Discriminator,
                        SourceMessageId = message.Reference.MessageId.GetValueOrDefault(0L).ToString(),
                        FromUserDiscriminator = message.Author.Discriminator,
                        FromUserId = message.Author.Id.ToString(),
                        MessageType = DiscordMessageType.Channel,
                        Message = message.Content
                    });
                }
                catch (Exception e)
                {
                    success = false;
                    this.logger.LogError($"Failed to process discord message: {e}", e);
                }


            }
            metrics.AddCount("HandlerTriggered", handlerTriggered ? 1.0 : 0.0);
            metrics.AddCount("NoHandler", handlerTriggered ? 0.0 : 1.0);
            metrics.AddCount("ProcessSuccess", success ? 1.0 : 0.0);
            metrics.AddCount("ProcessFailure", success ? 0.0 : 1.0);
            metrics.Close();
        }

        private async Task WebhookClientOnLog(LogMessage log)
        {
            this.logger.LogInformation(log.ToString());
        }

        private async Task WebhookClientOnReady()
        {
            this.logger.LogInformation($"{this.socketClient.CurrentUser} is connected!");
        }

    }
}