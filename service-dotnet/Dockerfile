FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["url-shorten-service/url-shorten-service.csproj", "url-shorten-service/"]
RUN dotnet restore "url-shorten-service/url-shorten-service.csproj"
COPY . .
WORKDIR "/src/url-shorten-service"
RUN dotnet build "url-shorten-service.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "url-shorten-service.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "url-shorten-service.dll"]
