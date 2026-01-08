# Railway Environment Variables Configuration

## MongoDB Database
T? ??ng t?o b?i Railway khi add MongoDB service.
- Bi?n: `MONGO_URL`, `MONGODB_URI`

## PostgreSQL Database (n?u d�ng thay SQL Server)
T? ??ng t?o b?i Railway khi add PostgreSQL service.
- Bi?n: `DATABASE_URL`, `POSTGRES_CONNECTION_STRING`

---

## Service-Node (Authentication Service)

### Required Variables:
```
PORT=5000
NODE_ENV=production
JWT_SECRET=t4LQRcBnnA6hyucvkz6WJcwzaQA3GtF92bHatyNYh4D7XeJJpKCL
```

### Reference Variables (Railway auto-inject):
```
MONGODB_URI=${{MongoDB.MONGO_URL}}
```

**C�ch set trong Railway:**
1. V�o service "service-node"
2. Tab "Variables"
3. Add c�c bi?n tr�n
4. D�ng `${{MongoDB.MONGO_URL}}` ?? reference MongoDB service

---

## Service-DotNet (URL Shortener Service)

### Required Variables:
```
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:8080
```

### JWT Settings:
```
JwtSettings__Secret=t4LQRcBnnA6hyucvkz6WJcwzaQA3GtF92bHatyNYh4D7XeJJpKCL
JwtSettings__ExpiryMinutes=1440
JwtSettings__Issuer=UrlShortener
```

### Database Connection (option 1 - PostgreSQL):
N?u d�ng PostgreSQL tr�n Railway:
```
ConnectionStrings__url_shorten_serviceContext=${{Postgres.DATABASE_URL}}
```

### Database Connection (option 2 - External SQL Server):
N?u d�ng Azure SQL ho?c external SQL Server:
```
ConnectionStrings__url_shorten_serviceContext=Server=your-server.database.windows.net;Database=ShortenURL;User Id=admin;Password=your-password;Encrypt=True;TrustServerCertificate=False;
```

**L?u �**: N?u chuy?n sang PostgreSQL, c?n:
1. Thay `Microsoft.EntityFrameworkCore.SqlServer` ? `Npgsql.EntityFrameworkCore.PostgreSQL`
2. Update `Program.cs`: `UseSqlServer()` ? `UseNpgsql()`

---

## Frontend (Vue.js)

### Required Variables:
```
VUE_APP_API_BASE_URL=https://gateway-production-xxxx.up.railway.app
```

**L?u �**: 
- Thay `gateway-production-xxxx.up.railway.app` b?ng URL th?t c?a Gateway service
- Nh? th�m `https://` ph�a tr??c
- Ho?c d�ng reference: `https://${{Gateway.RAILWAY_STATIC_URL}}`

---

## Gateway (Ocelot API Gateway)

### Required Variables:
```
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:8080
```

### JWT Settings:
```
JwtSettings__Secret=t4LQRcBnnA6hyucvkz6WJcwzaQA3GtF92bHatyNYh4D7XeJJpKCL
```

### Service URLs (Private Networking):
C?n update ocelot.json ?? d�ng Railway private networking:
```
SERVICE_NODE_URL=http://service-node.railway.internal:5000
SERVICE_DOTNET_URL=http://service-dotnet.railway.internal:8080
```

**C�ch config trong ocelot.json:**
```json
{
  "Routes": [
    {
      "DownstreamPathTemplate": "/api/auth/{everything}",
      "DownstreamScheme": "http",
      "DownstreamHostAndPorts": [
        {
          "Host": "service-node.railway.internal",
          "Port": 5000
        }
      ]
    }
  ]
}
```

---

## Frontend (Vue.js)

### Build-time Variables:
```
VUE_APP_API_URL=https://your-gateway.railway.app
```

**L?u �**: 
- Frontend c?n rebuild khi thay ??i bi?n m�i tr??ng
- URL c?a Gateway ph?i l� public domain do Railway cung c?p
- C� th? set runtime config b?ng c�ch d�ng nginx + env substitution

---

## CORS Configuration

Sau khi c� public domain c?a Railway, c?n update CORS:

### service-node/server.js:
```javascript
const corsOptions = {
    origin: [
        'https://your-frontend.railway.app',
        'https://your-gateway.railway.app',
        'http://localhost:8080'  // For local dev
    ],
    credentials: true
};
```

### service-dotnet & gateway Program.cs:
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigins",
        builder =>
        {
            builder.WithOrigins(
                "https://your-frontend.railway.app",
                "http://localhost:8080"
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
        });
});
```

---

## Security Best Practices

1. **JWT Secret**: 
   - ??i secret m?i cho production
   - D�ng bi?n m�i tr??ng, kh�ng hardcode
   - T?i thi?u 32 characters

2. **Database Passwords**:
   - Railway t? generate passwords m?nh
   - Kh�ng commit connection strings v�o Git

3. **API Keys**:
   - L?u trong Railway Variables
   - Reference qua `${{SERVICE.VARIABLE}}`

---

## Testing Environment Variables Locally

T?o file `.env` local (kh�ng commit):

### service-node/.env:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/url-shortener-auth
JWT_SECRET=t4LQRcBnnA6hyucvkz6WJcwzaQA3GtF92bHatyNYh4D7XeJJpKCL
NODE_ENV=development
```

### Test with Docker:
```bash
docker build -t service-node ./service-node
docker run --env-file ./service-node/.env -p 5000:5000 service-node
```

---

## Railway CLI Commands

Set bi?n m�i tr??ng qua CLI:
```bash
# Login
railway login

# Link to project
railway link

# Set variables
railway variables set PORT=5000
railway variables set MONGODB_URI=${{MongoDB.MONGO_URL}}

# View all variables
railway variables

# Deploy
railway up
```
