# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Sửa đường dẫn này
COPY ["gateway/Ocelot Gateway/Ocelot Gateway.csproj", "Ocelot Gateway/"]
RUN dotnet restore "Ocelot Gateway/Ocelot Gateway.csproj"

# Sửa đường dẫn này - lưu ý dấu cách trong tên thư mục
COPY gateway/Ocelot\ Gateway/ Ocelot\ Gateway/

# Build the application
WORKDIR "/src/Ocelot Gateway"
RUN dotnet build "Ocelot Gateway.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "Ocelot Gateway.csproj" -c Release -o /app/publish

# Final stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Expose port
EXPOSE 9999

# Set environment variables
ENV ASPNETCORE_URLS=http://+:9999
ENV JWT_SECRET=t4LQRcBnnA6hyucvkz6WJcwzaQA3GtF92bHatyNYh4D7XeJJpKCL

ENTRYPOINT ["dotnet", "Ocelot Gateway.dll"]