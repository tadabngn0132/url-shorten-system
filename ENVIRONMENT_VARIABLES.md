# Railway Environment Variables Configuration

## MongoDB Database
T? ??ng t?o b?i Railway khi add MongoDB service.
- Bi?n: `MONGO_URL`, `MONGODB_URI`

## PostgreSQL Database (n?u dùng thay SQL Server)
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

**Cách set trong Railway:**
1. Vào service "service-node"
2. Tab "Variables"
3. Add các bi?n trên
4. Dùng `${{MongoDB.MONGO_URL}}` ?? reference MongoDB service

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
N?u dùng PostgreSQL trên Railway:
```
ConnectionStrings__url_shorten_serviceContext=${{Postgres.DATABASE_URL}}
```

### Database Connection (option 2 - External SQL Server):
N?u dùng Azure SQL ho?c external SQL Server:
```
ConnectionStrings__url_shorten_serviceContext=Server=your-server.database.windows.net;Database=ShortenURL;User Id=admin;Password=your-password;Encrypt=True;TrustServerCertificate=False;
```

**L?u ý**: N?u chuy?n sang PostgreSQL, c?n:
1. Thay `Microsoft.EntityFrameworkCore.SqlServer` ? `Npgsql.EntityFrameworkCore.PostgreSQL`
2. Update `Program.cs`: `UseSqlServer()` ? `UseNpgsql()`

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
C?n update ocelot.json ?? dùng Railway private networking:
```
SERVICE_NODE_URL=http://service-node.railway.internal:5000
SERVICE_DOTNET_URL=http://service-dotnet.railway.internal:8080
```

**Cách config trong ocelot.json:**
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

**L?u ý**: 
- Frontend c?n rebuild khi thay ??i bi?n môi tr??ng
- URL c?a Gateway ph?i là public domain do Railway cung c?p
- Có th? set runtime config b?ng cách dùng nginx + env substitution

---

## CORS Configuration

Sau khi có public domain c?a Railway, c?n update CORS:

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
   - Dùng bi?n môi tr??ng, không hardcode
   - T?i thi?u 32 characters

2. **Database Passwords**:
   - Railway t? generate passwords m?nh
   - Không commit connection strings vào Git

3. **API Keys**:
   - L?u trong Railway Variables
   - Reference qua `${{SERVICE.VARIABLE}}`

---

## Testing Environment Variables Locally

T?o file `.env` local (không commit):

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

Set bi?n môi tr??ng qua CLI:
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
