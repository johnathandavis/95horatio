// -----------------------------------------------------------------------
// <copyright file="HueApiClient.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Clients.Hue
{
    using System;
    using System.Collections.Generic;
    using System.Net.Http;
    using System.Text;
    using System.Text.Json.Serialization;
    using System.Threading.Tasks;
    using Newtonsoft.Json;

    /// <summary>
    /// A HueApiClient class.
    /// </summary>
    public class HueApiClient
    {
        private readonly string endpoint;
        private readonly string username;
        private readonly HttpClient httpClient;

        public HueApiClient(string username, string endpoint)
        {
            var handler = new HttpClientHandler();
            handler.ServerCertificateCustomValidationCallback =
                HttpClientHandler.DangerousAcceptAnyServerCertificateValidator;
            this.httpClient = new HttpClient(handler);
            this.endpoint = endpoint;
            this.username = username;
        }

        public async Task<Dictionary<string, dynamic>> ListLightsAsync()
        {
            var response = await httpClient.GetAsync($"{endpoint}/api/{username}/lights");
            var responseJson = await response.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<Dictionary<string, dynamic>>(responseJson);
        }

        public async Task UpdateLightStateAsync(string lightId, string newStateJson)
        {
            var response = await httpClient.PutAsync($"{endpoint}/api/{username}/lights/{lightId}/state",
                new StringContent(
                    newStateJson,
                    Encoding.UTF8,
                    "application/json"));
        }
    }
}