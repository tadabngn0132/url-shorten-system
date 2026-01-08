# Deploy URL Shorten System to Railway

H??ng d?n deploy h? th?ng r�t g?n URL l�n Railway.

## T?ng quan ki?n tr�c

H? th?ng g?m 4 services:
- **Frontend**: Vue.js (Nginx)
- **Gateway**: Ocelot API Gateway (.NET 8)
- **Service-Node**: Authentication Service (Node.js + MongoDB)
- **Service-DotNet**: URL Shortener Service (.NET 8 + SQL Server)

## B??c 1: Chu?n b? Railway Project

1. ??ng nh?p v�o [Railway](https://railway.app)
2. T?o m?t Project m?i
3. Trong Project, t?o c�c services sau:

### Service 1: MongoDB Database
- Click **+ New** ? **Database** ? **Add MongoDB**
- Railway s? t? ??ng t?o v� cung c?p `MONGODB_URI`

### Service 2: PostgreSQL (ho?c MySQL cho URL Service)
- Click **+ New** ? **Database** ? **Add PostgreSQL**
- Railway s? t? ??ng t?o connection string
- **L?u �**: N?u mu?n d�ng SQL Server, c?n t? host ho?c d�ng Azure SQL

## B??c 2: Deploy c�c Services

### 2.1 Deploy Service-Node (Authentication)

1. Click **+ New** ? **GitHub Repo** ? ch?n repository c?a b?n
2. Trong **Settings** c?a service:
   - **Root Directory**: `service-node`
   - **Build Command**: (?? tr?ng, Docker s? t? build)
   - **Start Command**: (?? tr?ng, s? d?ng CMD trong Dockerfile)

3. Th�m **Environment Variables**:
   ```
   PORT=5000
   MONGODB_URI=${{MongoDB.MONGO_URL}}
   JWT_SECRET=t4LQRcBnnA6hyucvkz6WJcwzaQA3GtF92bHatyNYh4D7XeJJpKCL
   NODE_ENV=production
   ```

4. Railway s? t? detect Dockerfile v� build

### 2.2 Deploy Service-DotNet (URL Shortener)

1. Click **+ New** ? **GitHub Repo** ? ch?n c�ng repository
2. Trong **Settings**:
   - **Root Directory**: `service-dotnet`
   - Railway s? t? ??ng detect Dockerfile

3. Th�m **Environment Variables**:
   ```
   ASPNETCORE_ENVIRONMENT=Production
   ASPNETCORE_URLS=http://+:8080
   ConnectionStrings__url_shorten_serviceContext=${{Postgres.DATABASE_URL}}
   JwtSettings__Secret=t4LQRcBnnA6hyucvkz6WJcwzaQA3GtF92bHatyNYh4D7XeJJpKCL
   JwtSettings__ExpiryMinutes=1440
   JwtSettings__Issuer=UrlShortener
   ```

**L?u �**: N?u d�ng PostgreSQL, c?n update code ?? d�ng Npgsql thay v� SQL Server.

### 2.3 Deploy Gateway (Ocelot)

1. Click **+ New** ? **GitHub Repo** ? ch?n c�ng repository
2. Trong **Settings**:
   - **Root Directory**: `gateway`

3. Th�m **Environment Variables**:
   ```
   ASPNETCORE_ENVIRONMENT=Production
   ASPNETCORE_URLS=http://+:8080
   JwtSettings__Secret=t4LQRcBnnA6hyucvkz6WJcwzaQA3GtF92bHatyNYh4D7XeJJpKCL
   ```

4. **C?p nh?t ocelot.json** ?? tr? ??n internal URLs c?a c�c services:
   - Service-Node: `http://service-node.railway.internal:5000`
   - Service-DotNet: `http://service-dotnet.railway.internal:8080`

### 2.4 Deploy Frontend

1. Click **+ New** ? **GitHub Repo** ? ch?n c�ng repository
2. Trong **Settings**:
   - **Root Directory**: `frontend`

3. **Environment Variables**:
   ```
   VUE_APP_API_BASE_URL=https://${{Gateway.RAILWAY_STATIC_URL}}
   ```
   
   **L?u �**: 
   - Tên bi?n ph?i l� `VUE_APP_API_BASE_URL` (KHÔNG ph?i VUE_APP_API_URL)
   - Nh? th�m `https://` tr??c domain c?a Gateway
   - D�ng `RAILWAY_STATIC_URL` thay v� `RAILWAY_PUBLIC_DOMAIN`
   - VD: `https://gateway-production-xxxx.up.railway.app`

4. Expose port 80 ?? Railway t?o public domain

## B??c 3: C?u h�nh Networking

Railway cung c?p 2 lo?i networking:
- **Public Domain**: Cho frontend v� gateway (public access)
- **Private Network**: Service-to-service communication

1. T?o **Public Domain** cho:
   - Frontend
   - Gateway

2. C�c service n?i b? d�ng **Private Network**:
   - `service-node.railway.internal`
   - `service-dotnet.railway.internal`

## B??c 4: Migration Database

### Cho Service-DotNet:
Railway kh�ng t? ch?y migrations. B?n c?n:

**Option 1**: Th�m migration v�o startup code
```csharp
// Program.cs
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<DbContext>();
    db.Database.Migrate();
}
```

**Option 2**: Ch?y migration th? c�ng qua Railway CLI
```bash
railway run dotnet ef database update
```

## B??c 5: Ki?m tra Deployment

1. Ki?m tra logs c?a t?ng service trong Railway Dashboard
2. Test c�c endpoints:
   - Frontend: `https://your-frontend.railway.app`
   - Gateway: `https://your-gateway.railway.app/swagger`
   - Health checks

## L?u � quan tr?ng

### 1. Database cho .NET Service
Railway kh�ng c� SQL Server native. C�c options:
- ? **Khuy?n ngh?**: Chuy?n sang PostgreSQL (update code v� packages)
- D�ng Azure SQL Database (external)
- D�ng MySQL (Railway c� support)

### 2. CORS Configuration
Update CORS trong c�c services ?? cho ph�p domain c?a Railway:
```javascript
// service-node/server.js
const corsOptions = {
    origin: [
        'https://your-frontend.railway.app',
        'https://your-gateway.railway.app'
    ],
    credentials: true
};
```

### 3. Environment-specific Configs
- T?o `appsettings.Production.json` cho .NET services
- D�ng bi?n m�i tr??ng thay v� hardcode
- Kh�ng commit secrets v�o Git

### 4. Pricing
- Railway free tier: $5 credit/month
- M?i service t�nh ti?n theo usage
- Database c?n nhi?u resources nh?t

## Troubleshooting

### Service kh�ng start
- Check logs trong Railway dashboard
- Verify environment variables
- Ensure Dockerfile EXPOSE ?�ng port

### Database connection failed
- Verify connection string format
- Check database service status
- Ensure private networking enabled

### CORS errors
- Update allowed origins
- Check credentials setting
- Verify headers configuration

## Deployment Updates

Khi push code m?i l�n GitHub:
1. Railway t? ??ng detect changes
2. Rebuild v� redeploy service
3. Zero-downtime deployment (n?u c?u h�nh ?�ng)

## Resources

- [Railway Documentation](https://docs.railway.app/)
- [Railway Private Networking](https://docs.railway.app/reference/private-networking)
- [Railway Environment Variables](https://docs.railway.app/develop/variables)
