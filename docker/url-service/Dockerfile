# Giai đoạn xây dựng
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Sao chép tệp csproj và khôi phục dependencies
COPY ["service-dotnet/url-shorten-service/url-shorten-service.csproj", "url-shorten-service/"]
RUN dotnet restore "url-shorten-service/url-shorten-service.csproj"

# Sao chép phần còn lại của mã
COPY service-dotnet/url-shorten-service/ url-shorten-service/

# Xây dựng ứng dụng
WORKDIR "/src/url-shorten-service"
RUN dotnet build "url-shorten-service.csproj" -c Release -o /app/build

# Giai đoạn publish
FROM build AS publish
RUN dotnet publish "url-shorten-service.csproj" -c Release -o /app/publish

# Giai đoạn cuối
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Mở cổng
EXPOSE 6996

# Thiết lập biến môi trường
ENV ASPNETCORE_URLS=http://+:6996
ENV JWT_SECRET=t4LQRcBnnA6hyucvkz6WJcwzaQA3GtF92bHatyNYh4D7XeJJpKCL

# Thay thế connection string cứng với biến môi trường
ENV ConnectionStrings__url_shorten_serviceContext="Server=sqlserver;Database=ShortenURL;User Id=sa;Password=YourStrong!Passw0rd;TrustServerCertificate=True;"

ENTRYPOINT ["dotnet", "url-shorten-service.dll"]