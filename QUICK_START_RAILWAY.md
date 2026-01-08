# Quick Start: Deploy to Railway

## ?? Checklist tr??c khi deploy

- [ ] Account Railway ?� t?o
- [ ] Repository ?� push l�n GitHub
- [ ] ?� ??c `RAILWAY_DEPLOYMENT.md`
- [ ] ?� chu?n b? c�c bi?n m�i tr??ng

## ?? QUAN TR?NG: Monorepo Configuration

D? �n n�y l� **monorepo** v?i nhi?u services. B?n ph?i:
1. **Deploy m?i service ri�ng bi?t** (4 services = 4 deployments)
2. **B?t bu?c set Root Directory** cho T?NG service
3. Railway s? ch? build code trong Root Directory ?� ch?n

**L?u �**: N?u kh�ng set Root Directory, Railway s? b�o l?i "could not determine how to build the app"

## ?? C�c b??c deploy nhanh

### 1. T?o Railway Project
```
1. V�o railway.app
2. Click "New Project"
3. Ch?n "Empty Project" (t?o project tr?ng tr??c)
4. ??t t�n project: "URL Shortener System"
```

### 2. Th�m Databases
```
Trong project v?a t?o:
- Click "+ New" ? Database ? MongoDB
- Click "+ New" ? Database ? PostgreSQL (n?u kh�ng d�ng SQL Server)

??i databases kh?i ??ng xong (status = Active)
```

### 3. Deploy Services (theo th? t?)

#### Service 1: service-node

**B??c 1**: Th�m service
```
1. Click "+ New" ? "GitHub Repo"
2. Authorize GitHub n?u ch?a
3. Ch?n repository: "url-shorten-system"
4. Railway s? t?o service m?i
```

**B??c 2**: Configure service ?? QUAN TR?NG
```
1. Click v�o service v?a t?o
2. Settings ? General ? Service Name: ??i th�nh "service-node"
3. Settings ? Source ? Root Directory: "/service-node" ? B?T BU?C! (c� d?u /)
4. Save Changes

L?u �: Railway y�u c?u d?u / ? ??u cho Root Directory
```

**B??c 3**: Set bi?n m�i tr??ng
```
Variables tab ? Add variables:
  PORT=5000
  MONGODB_URI=${{MongoDB.MONGO_URL}}
  JWT_SECRET=t4LQRcBnnA6hyucvkz6WJcwzaQA3GtF92bHatyNYh4D7XeJJpKCL
  NODE_ENV=production
```

**B??c 4**: Deploy
```
- Railway s? t? ??ng trigger build sau khi save
- Check tab "Deployments" ?? xem progress
- ??i build th�nh c�ng (status = Success)
```

---

#### Service 2: service-dotnet

**B??c 1**: Th�m service m?i
```
1. V? Project view
2. Click "+ New" ? "GitHub Repo"
3. Ch?n repository: "url-shorten-system" (c�ng repo)
4. Railway s? t?o service m?i (service th? 2)
```

**B??c 2**: Configure service ?? QUAN TR?NG
```
1. Click v�o service v?a t?o
2. Settings ? General ? Service Name: "service-dotnet"
3. Settings ? Source ? Root Directory: "service-dotnet" ? B?T BU?C!
4. Save Changes
```

**B??c 3**: Set bi?n m�i tr??ng
```
Variables tab:
  ASPNETCORE_ENVIRONMENT=Production
  ASPNETCORE_URLS=http://+:8080
  ConnectionStrings__url_shorten_serviceContext=${{Postgres.DATABASE_URL}}
  JwtSettings__Secret=t4LQRcBnnA6hyucvkz6WJcwzaQA3GtF92bHatyNYh4D7XeJJpKCL
  JwtSettings__ExpiryMinutes=1440
  JwtSettings__Issuer=UrlShortener
```

**L?u �**: N?u d�ng PostgreSQL, ph?i migrate code tr??c (xem POSTGRESQL_MIGRATION.md)

---

#### Service 3: gateway

**B??c 1**: Th�m service m?i
```
1. V? Project view
2. "+ New" ? "GitHub Repo" ? "url-shorten-system"
```

**B??c 2**: Configure service ?? QUAN TR?NG
```
1. Service Name: "gateway"
2. Root Directory: "gateway" ? B?T BU?C!
```

**B??c 3**: Set bi?n m�i tr??ng
```
Variables:
  ASPNETCORE_ENVIRONMENT=Production
  ASPNETCORE_URLS=http://+:8080
  JwtSettings__Secret=t4LQRcBnnA6hyucvkz6WJcwzaQA3GtF92bHatyNYh4D7XeJJpKCL
```

**B??c 4**: Generate Public Domain
```
1. Settings ? Networking ? Generate Domain
2. Copy domain (vd: gateway-production-xxxx.up.railway.app)
3. L?U L?I domain n�y ?? d�ng cho frontend!
```

---

#### Service 4: frontend

**B??c 1**: Th�m service m?i
```
1. V? Project view
2. "+ New" ? "GitHub Repo" ? "url-shorten-system"
```

**B??c 2**: Configure service ?? QUAN TR?NG
```
1. Service Name: "frontend"
2. Root Directory: "frontend" ? B?T BU?C!
```

**B??c 3**: Set bi?n m�i tr??ng
```
Variables:
  VUE_APP_API_URL=https://[GATEWAY_DOMAIN_T?_B??C_3]

V� d?:
  VUE_APP_API_URL=https://gateway-production-xxxx.up.railway.app
```

**B??c 4**: Generate Public Domain
```
Settings ? Networking ? Generate Domain
```

---

### 4. C?u h�nh Private Networking (cho Gateway)

Gateway c?n g?i c�c services n?i b? qua private network:

**File c?n update**: `gateway/Ocelot Gateway/ocelot.json`

T�m v� thay ??i t?t c? `DownstreamHostAndPorts`:

```json
// Cho service-node (auth)
{
  "DownstreamHostAndPorts": [
    {
      "Host": "service-node.railway.internal",
      "Port": 5000
    }
  ]
}

// Cho service-dotnet (URL shortener)
{
  "DownstreamHostAndPorts": [
    {
      "Host": "service-dotnet.railway.internal",
      "Port": 8080
    }
  ]
}
```

**Commit v� push**:
```bash
git add gateway/Ocelot\ Gateway/ocelot.json
git commit -m "Update ocelot.json for Railway private networking"
git push
```

Railway s? t? ??ng redeploy gateway service.

---

### 5. Update CORS (sau khi c� domains)

**File**: `service-node/server.js`
```javascript
const corsOptions = {
    origin: [
        'https://your-frontend.railway.app',  // Thay = frontend domain
        'https://your-gateway.railway.app',   // Thay = gateway domain
        'http://localhost:8080'
    ],
    credentials: true
};
```

**File**: `service-dotnet/url-shorten-service/Program.cs`
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins",
        builder =>
        {
            builder.WithOrigins(
                "https://your-frontend.railway.app",  // Thay domain
                "http://localhost:8080"
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
        });
});
```

Commit v� push ?? trigger redeploy.

---

### 6. Ki?m tra Deployment
```
? All services showing "Active" status
? Check logs c?a t?ng service (kh�ng c� error)
? Test gateway endpoint: https://[gateway-domain]/swagger
? Test frontend: https://[frontend-domain]
? Test authentication flow
? Test URL shortening
```

---

## ?? Troubleshooting nhanh

### ? Error: "could not determine how to build the app"

**Nguy�n nh�n**: Ch?a set Root Directory

**Gi?i ph�p**:
```
1. V�o service b? l?i
2. Settings ? Source
3. Set "Root Directory" = t�n folder service
   (service-node / service-dotnet / gateway / frontend)
4. Save ? Railway s? t? ??ng rebuild
```

### ? Build failed - Dockerfile not found

**Gi?i ph�p**:
```
1. Verify Root Directory ?� set ?�ng
2. Check Dockerfile c� trong folder ?� kh�ng
3. Xem build logs ?? bi?t Railway ?ang t�m file ? ?�u
```

### ? Service crashed after deploy

**Check list**:
```
1. View Logs ?? xem error message
2. Verify environment variables
3. Check database connection strings
4. Ensure PORT match v?i code
```

### ? Database connection failed

**Gi?i ph�p**:
```
1. Check database service ?ang Active
2. Verify variable reference: ${{MongoDB.MONGO_URL}} ho?c ${{Postgres.DATABASE_URL}}
3. Enable Private Networking: Settings ? Networking
4. Check connection string format
```

### ? CORS errors in browser

**Gi?i ph�p**:
```
1. Update CORS origins v?i Railway domains
2. Commit v� push ?? redeploy
3. Clear browser cache
4. Verify credentials: true setting
```

### ? 502 Bad Gateway

**Gi?i ph�p**:
```
1. Check downstream services ?ang running
2. Verify private networking URLs in ocelot.json
3. Check service names match: [service-name].railway.internal
4. View gateway logs
```

---

## ?? T�i li?u chi ti?t

- `RAILWAY_DEPLOYMENT.md` - H??ng d?n ??y ??
- `ENVIRONMENT_VARIABLES.md` - Chi ti?t v? env vars
- `POSTGRESQL_MIGRATION.md` - Migrate t? SQL Server
- `CHECKLIST.md` - Checklist ??y ??
- M?i service c� `Dockerfile` v� `railway.json`

## ?? Chi ph�

Railway free tier:
- $5 credit/month
- ~500 hours usage (t�nh tr�n t?t c? services)
- 4 services + 2 databases = ~$0.50-1/day
- ?? cho testing v� demo

**Tip**: Pause services kh�ng d�ng ?? ti?t ki?m credit

## ?? Railway Dashboard Overview

```
Project: URL Shortener System
??? MongoDB (Database)
??? PostgreSQL (Database) 
??? service-node (Service) - Root: service-node
??? service-dotnet (Service) - Root: service-dotnet
??? gateway (Service) - Root: gateway - Public Domain ?
??? frontend (Service) - Root: frontend - Public Domain ?
```

## ?? Expected Resource Usage

```
Service          | RAM  | CPU | Storage
-----------------|------|-----|--------
MongoDB          | ~100MB | Low | Varies
PostgreSQL       | ~100MB | Low | Varies
service-node     | ~100MB | Low | -
service-dotnet   | ~200MB | Med | -
gateway          | ~200MB | Med | -
frontend         | ~50MB  | Low | -
```

## ?? C?n h? tr??

1. Check Railway docs: https://docs.railway.app
2. Railway Discord: https://discord.gg/railway
3. Check logs trong Dashboard
4. Review c�c file .md trong repo n�y

---

## ?? C�c b??c t�m t?t

1. ? T?o Empty Project
2. ? Add MongoDB + PostgreSQL
3. ? Add 4 services t? c�ng 1 GitHub repo
4. ?? **QUAN TR?NG**: Set Root Directory cho T?NG service
5. ? Set environment variables
6. ? Generate domains cho gateway + frontend
7. ? Update ocelot.json v?i private networking
8. ? Update CORS v?i Railway domains
9. ? Test deployment

---

**L?u � quan tr?ng:**
- ?? **B?T BU?C set Root Directory** cho m?i service
- SQL Server kh�ng c� s?n tr�n Railway ? Khuy?n ngh? chuy?n sang PostgreSQL
- M?i l?n thay ??i code v� push l�n GitHub, Railway s? t? ??ng redeploy
- Private networking: `[service-name].railway.internal`
- Public domains: Generate trong Settings ? Networking
