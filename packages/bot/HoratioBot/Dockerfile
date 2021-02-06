FROM mcr.microsoft.com/dotnet/sdk:5.0 AS build
RUN curl -o /usr/local/share/ca-certificates/verisign.crt -SsL https://crt.sh/?d=1039083 && update-ca-certificates
WORKDIR /DockerSource

# Copy everything else and build website
COPY ./ ./HoratioBot/
WORKDIR /DockerSource/HoratioBot
RUN dotnet restore
RUN dotnet publish -c release -o /DockerOutput/HoratioBot --no-restore

# Final stage / image
FROM mcr.microsoft.com/dotnet/aspnet:5.0
WORKDIR /DockerOutput/HoratioBot
COPY --from=build /DockerOutput/HoratioBot ./
ENTRYPOINT ["dotnet", "HoratioBot.dll"]