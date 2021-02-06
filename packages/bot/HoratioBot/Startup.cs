// -----------------------------------------------------------------------
// <copyright file="Startup.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot
{
    using System;
    using System.Collections.Generic;
    using Amazon;
    using Amazon.ApiGatewayManagementApi;
    using Amazon.Athena;
    using Amazon.CloudWatch;
    using Amazon.CognitoIdentityProvider;
    using Amazon.Comprehend;
    using Amazon.DynamoDBv2;
    using Amazon.Extensions.NETCore.Setup;
    using Amazon.KinesisFirehose;
    using Amazon.Runtime;
    using Amazon.Runtime.CredentialManagement;
    using Amazon.SecretsManager;
    using Amazon.ServiceDiscovery;
    using Amazon.SQS;
    using Discord.WebSocket;
    using HoratioBot.Clients;
    using HoratioBot.Clients.Discovery;
    using HoratioBot.Credentials;
    using HoratioBot.Handlers;
    using HoratioBot.Metrics;
    using HoratioBot.Services;
    using HoratioBot.Storage;
    using HoratioBot.Storage.Messages;
    using HoratioBot.Web;
    using Microsoft.AspNetCore.Builder;
    using Microsoft.AspNetCore.Hosting;
    using Microsoft.Extensions.Configuration;
    using Microsoft.Extensions.DependencyInjection;
    using Microsoft.Extensions.Hosting;
    using Microsoft.Extensions.Logging;
    using Microsoft.OpenApi.Models;

    /// <summary>
    /// A Startup class.
    /// </summary>
    public class Startup
    {
        readonly string MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            var awsOptions = CreateAWSOptions();

            services.AddControllers();
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo {Title = "WebApiTest", Version = "v1"});
            });

            services.AddDefaultAWSOptions(awsOptions);
            services.AddAWSService<IAmazonSecretsManager>();
            services.AddAWSService<IAmazonDynamoDB>();
            services.AddAWSService<IAmazonComprehend>();
            services.AddAWSService<IAmazonCloudWatch>();
            services.AddAWSService<IAmazonKinesisFirehose>();
            services.AddAWSService<IAmazonCognitoIdentityProvider>();
            services.AddAWSService<IAmazonServiceDiscovery>();
            services.AddAWSService<IAmazonAthena>();
            services.AddAWSService<IAmazonSQS>();
            services.AddSingleton<ISentimentReporter>((svc) =>
            {
                var athena = svc.GetRequiredService<IAmazonAthena>();
                var resources = svc.GetRequiredService<IResourceDiscoverer>();;
                var logger = svc.GetRequiredService<ILogger<AthenaSentimentReporter>>();
                return new AthenaSentimentReporter(athena, "chatlogs", "data", resources.Analytics, logger);
            });
            services.AddSingleton<IMetricsFactory>((svc) =>
            {
                var cloudwatch = svc.GetRequiredService<IAmazonCloudWatch>();
                string metricNamespace = "HoratioBot";
                return new CloudWatchMetricsFactory(cloudwatch, metricNamespace);
            });
            services.AddSingleton<IResourceDiscoverer>((svc) =>
            {
                string serviceId = Environment.GetEnvironmentVariable("SERVICE_DISCOVERY_ID") ?? "srv-rby7ki3kzcsqk4vp";
                var discovery = svc.GetRequiredService<IAmazonServiceDiscovery>();
                return new CloudMapResourceDiscoverer(discovery, serviceId);
            });
            services.AddSingleton<ISocketSessionStorage>((svc) =>
            {
                var ddb = svc.GetRequiredService<IAmazonDynamoDB>();
                var resources = svc.GetRequiredService<IResourceDiscoverer>();;
                return new DynamoSocketSessionStorage(ddb, resources.Storage.SocketSessionsTable);
            });
            services.AddSingleton<IAlertBroadcaster>((svc) =>
            {
                var resources = svc.GetRequiredService<IResourceDiscoverer>();
                var sessionStorage = svc.GetRequiredService<ISocketSessionStorage>();
                var logger = svc.GetRequiredService<ILogger<ApiGatewayWebsocketAlertBroadcaster>>();
                var client = new AmazonApiGatewayManagementApiClient(awsOptions.Credentials,
                    new AmazonApiGatewayManagementApiConfig()
                    {
                        RegionEndpoint = awsOptions.Region,
                        ServiceURL =
                            $"https://api-ws.95horatio.johndavis.dev",
                        AuthenticationRegion = "us-east-2"
                    });
                return new ApiGatewayWebsocketAlertBroadcaster(client, sessionStorage, logger);
            });
            services.AddSingleton<IPaginationTokensStorage>((svc) =>
            {
                var ddb = svc.GetRequiredService<IAmazonDynamoDB>();
                var resources = svc.GetRequiredService<IResourceDiscoverer>();;
                return new DynamoPaginationTokensStorage(ddb, resources.Storage.PaginationTokensTable);
            });
            services.AddSingleton<ILinkRequestsStorageManager>((svc) =>
            {
                var ddb = svc.GetRequiredService<IAmazonDynamoDB>();
                var resources = svc.GetRequiredService<IResourceDiscoverer>();
                return new DynamoLinkRequestsStorageManager(ddb, resources.Storage.LinkRequestsTable);
            });
            services.AddSingleton<IUserIdsStorageManager>((svc) =>
            {
                var ddb = svc.GetRequiredService<IAmazonDynamoDB>();
                var resources = svc.GetRequiredService<IResourceDiscoverer>();;
                return new DynamoUserIdsStorageManager(ddb, resources.Storage.UserIdsTable);
            });
            services.AddSingleton<IChatMessageStorage>((svc) =>
            {
                var paginationStorage = svc.GetRequiredService<IPaginationTokensStorage>();
                var ddb = svc.GetRequiredService<IAmazonDynamoDB>();
                var resources = svc.GetRequiredService<IResourceDiscoverer>();;
                return new DynamoChatMessageStorage(paginationStorage, ddb, resources.Storage.ChatMessagesTable);
            });
            services.AddSingleton<ISentimentSnapshotsStorage>((svc) =>
            {
                var ddb = svc.GetRequiredService<IAmazonDynamoDB>();
                var resources = svc.GetRequiredService<IResourceDiscoverer>();;
                return new DynamoSentimentSnapshotsStorage(ddb, resources.Storage.SentimentSnapshotTable);
            });
            services.AddSingleton<IMessageArchiver>((svc) =>
            {
                var kinesis = svc.GetRequiredService<IAmazonKinesisFirehose>();
                var comprehend = svc.GetRequiredService<IAmazonComprehend>();
                var chatMessageStorage = svc.GetRequiredService<IChatMessageStorage>();
                var userIdsStorage = svc.GetRequiredService<IUserIdsStorageManager>();
                var sentimentSnapshotsStorage = svc.GetRequiredService<ISentimentSnapshotsStorage>();
                var logger = svc.GetRequiredService<ILogger<KinesisMessageArchiver>>();
                var resources = svc.GetRequiredService<IResourceDiscoverer>();
                var broadcaster = svc.GetRequiredService<IAlertBroadcaster>();
                return new KinesisMessageArchiver(
                    kinesis,
                    comprehend,
                    chatMessageStorage,
                    userIdsStorage,
                    sentimentSnapshotsStorage,
                    broadcaster,
                    logger,
                    resources.Analytics.ChatStreamName);
            });
            services.AddSingleton<IKudosStorageManager>((svc) =>
            {
                var ddb = svc.GetRequiredService<IAmazonDynamoDB>();
                var logger = svc.GetRequiredService<ILogger<DynamoKudosStorageManager>>();
                var resources = svc.GetRequiredService<IResourceDiscoverer>();
                return new DynamoKudosStorageManager(ddb, resources.Storage.KudosTable, logger);
            });
            services.AddSingleton<IUsersClient>((svc) =>
            {
                var cognito = svc.GetRequiredService<IAmazonCognitoIdentityProvider>();
                var userIdsStorage = svc.GetRequiredService<IUserIdsStorageManager>();
                var resources = svc.GetRequiredService<IResourceDiscoverer>();
                return new CognitoUsersClient(cognito, userIdsStorage, resources.Auth.UserPoolId);
            });
            services.AddSingleton<ISentimentAnalysisClient, ComprehendSentimentAnalysisClient>();
            services.AddSingleton<KudosCommandHandler>((svc) =>
            {
                var storage = svc.GetRequiredService<IKudosStorageManager>();
                var sentimentClient = svc.GetRequiredService<ISentimentAnalysisClient>();
                var logger = svc.GetRequiredService<ILogger<KudosCommandHandler>>();
                ulong serverId = 799375962998833152;
                ulong channelId = 799395846915489822;
                return new KudosCommandHandler(storage, sentimentClient, serverId, channelId, logger);
            });
            services.AddSingleton<TwitchLinkCommandHandler>();
            services.AddSingleton<DiscordSocketClient>();
            services.AddSingleton<IEnumerable<IDiscordCommandHandler>>((svc) =>
            {
                var kudosHandler = svc.GetRequiredService<KudosCommandHandler>();
                var linkHandler = svc.GetRequiredService<TwitchLinkCommandHandler>();
                return new IDiscordCommandHandler[]
                {
                    kudosHandler,
                    linkHandler,
                };
            });
            services.AddSingleton<IEnumerable<ITwitchCommandHandler>>((svc) =>
            {
                var kudosHandler = svc.GetRequiredService<TwitchLinkCommandHandler>();
                return new[]
                {
                    kudosHandler
                };
            });
            services.AddSingleton<IDiscordCredentialProvider>((svc) =>
            {
                var client = svc.GetRequiredService<IAmazonSecretsManager>();
                string secretName = "prod/web/Discord";
                var logger = svc.GetRequiredService<ILogger<SecretManagerDiscordCredentialProvider>>();
                return new SecretManagerDiscordCredentialProvider(
                    client,
                    secretName,
                    logger);
            });
            services.AddSingleton<ITwitchCredentialsProvider>((svc) =>
            {
                var client = svc.GetRequiredService<IAmazonSecretsManager>();
                string secretName = "prod/web/Twitch";
                var logger = svc.GetRequiredService<ILogger<SecretManagerTwitchCredentialProvider>>();
                return new SecretManagerTwitchCredentialProvider(
                    client,
                    secretName,
                    logger);
            });
            services.AddHostedService<TwitchBotWorker>();
            services.AddHostedService<DiscordBotWorker>();
            services.AddHostedService<SentimentReportGenerator>((svc) =>
            {
                var sqs = svc.GetRequiredService<IAmazonSQS>();
                var resources = svc.GetRequiredService<IResourceDiscoverer>();
                var reporter = svc.GetRequiredService<ISentimentReporter>();
                var userIdsStorage = svc.GetRequiredService<IUserIdsStorageManager>();
                var snapshotStorage = svc.GetRequiredService<ISentimentSnapshotsStorage>();
                var logger = svc.GetRequiredService<ILogger<SentimentReportGenerator>>();
                return new SentimentReportGenerator(sqs, reporter, resources.Analytics,
                    userIdsStorage, snapshotStorage, logger);
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "WebApiTest v1"));
            }

            //app.UseHttpsRedirection();
            app.UseRouting();
            app.UseAuthorization();
            app.UseCors(builder => builder.WithOrigins("https://95horatio.johndavis.dev")
                .AllowAnyMethod()
                .AllowAnyHeader());
            app.UseWebSockets();
            app.UseAuthInterceptor();
            app.UseStaticFiles();
            app.UseEndpoints(endpoints => { endpoints.MapControllers(); });
        }

        private static AWSOptions CreateAWSOptions()
        {
            AWSCredentials credentials;

            var chain = new CredentialProfileStoreChain();
            AWSCredentials awsCredentials;
            if (chain.TryGetAWSCredentials("95horatio", out awsCredentials))
            {
                credentials = awsCredentials;
            }
            else
            {
                credentials = FallbackCredentialsFactory.GetCredentials();
            }

            return new AWSOptions()
            {
                Credentials = credentials,
                Region = RegionEndpoint.USEast2
            };
        }
    }
}