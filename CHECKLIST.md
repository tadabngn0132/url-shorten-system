# ? Railway Deployment Checklist

## ?? Files ?ã ???c t?o

### Dockerfiles
- [x] `service-node/Dockerfile` - Node.js authentication service
- [x] `service-node/.dockerignore`
- [x] `service-dotnet/Dockerfile` - .NET URL shortener service  
- [x] `service-dotnet/.dockerignore`
- [x] `gateway/Dockerfile` - Ocelot API Gateway
- [x] `gateway/.dockerignore`
- [x] `frontend/Dockerfile` - Vue.js frontend
- [x] `frontend/.dockerignore`
- [x] `frontend/nginx.conf` - Nginx config cho Vue.js

### Configuration Files
- [x] `service-node/railway.json`
- [x] `service-dotnet/railway.json`
- [x] `gateway/railway.json`
- [x] `frontend/railway.json`
- [x] `service-node/.env.example`
- [x] `service-dotnet/url-shorten-service/appsettings.Production.json`
- [x] `gateway/Ocelot Gateway/appsettings.Production.json`

### Documentation
- [x] `RAILWAY_DEPLOYMENT.md` - H??ng d?n ??y ??
- [x] `QUICK_START_RAILWAY.md` - Quick start guide
- [x] `ENVIRONMENT_VARIABLES.md` - Env vars reference
- [x] `POSTGRESQL_MIGRATION.md` - SQL Server ? PostgreSQL migration
- [x] `CHECKLIST.md` - File này

### Scripts
- [x] `test-docker-builds.ps1` - Test Docker builds locally

---

## ?? Các b??c deploy (theo th? t?)

### 1?? Chu?n b? Code (Local)

- [ ] Review t?t c? Dockerfiles
- [ ] Test build Docker images locally (optional):
  ```powershell
  .\test-docker-builds.ps1
  ```
- [ ] Commit và push lên GitHub:
  ```bash
  git add .
  git commit -m "Add Railway deployment configuration"
  git push origin master
  ```

### 2?? Chu?n b? Railway Account

- [ ] ??ng ký/??ng nh?p Railway: https://railway.app
- [ ] Connect GitHub account
- [ ] T?o New Project

### 3?? Setup Databases

- [ ] **MongoDB**: New ? Database ? Add MongoDB
  - L?u l?i variable name (ví d?: `MongoDB`)
  
- [ ] **PostgreSQL** (n?u migrate t? SQL Server): New ? Database ? Add PostgreSQL
  - L?u l?i variable name (ví d?: `Postgres`)

### 4?? Deploy service-node

- [ ] New ? GitHub Repo ? ch?n `url-shorten-system`
- [ ] Rename service thành `service-node`
- [ ] Settings ? Set Root Directory: `service-node`
- [ ] Variables ? Add:
  ```
  PORT=5000
  NODE_ENV=production
  JWT_SECRET=t4LQRcBnnA6hyucvkz6WJcwzaQA3GtF92bHatyNYh4D7XeJJpKCL
  MONGODB_URI=${{MongoDB.MONGO_URL}}
  ```
- [ ] Wait for deployment to complete
- [ ] Check logs for errors

### 5?? Deploy service-dotnet

**?? QUAN TR?NG: Quy?t ??nh database**

**Option A: Dùng PostgreSQL (Khuy?n ngh?)**
- [ ] ??c `POSTGRESQL_MIGRATION.md`
- [ ] Update code ?? dùng PostgreSQL (see migration guide)
- [ ] Commit và push changes

**Option B: Dùng SQL Server external**
- [ ] Setup Azure SQL ho?c external SQL Server
- [ ] L?y connection string

**Sau khi ?ã ch?n database:**

- [ ] New ? GitHub Repo ? ch?n `url-shorten-system`
- [ ] Rename service thành `service-dotnet`
- [ ] Settings ? Root Directory: `service-dotnet`
- [ ] Variables ? Add:
  
  **N?u dùng PostgreSQL:**
  ```
  ASPNETCORE_ENVIRONMENT=Production
  ASPNETCORE_URLS=http://+:8080
  ConnectionStrings__url_shorten_serviceContext=${{Postgres.DATABASE_URL}}
  JwtSettings__Secret=t4LQRcBnnA6hyucvkz6WJcwzaQA3GtF92bHatyNYh4D7XeJJpKCL
  JwtSettings__ExpiryMinutes=1440
  JwtSettings__Issuer=UrlShortener
  ```
  
  **N?u dùng SQL Server external:**
  ```
  ASPNETCORE_ENVIRONMENT=Production
  ASPNETCORE_URLS=http://+:8080
  ConnectionStrings__url_shorten_serviceContext=Server=your-server;Database=ShortenURL;User Id=user;Password=pass;
  JwtSettings__Secret=t4LQRcBnnA6hyucvkz6WJcwzaQA3GtF92bHatyNYh4D7XeJJpKCL
  JwtSettings__ExpiryMinutes=1440
  JwtSettings__Issuer=UrlShortener
  ```

- [ ] Deploy và check logs

### 6?? Deploy gateway

- [ ] New ? GitHub Repo ? ch?n `url-shorten-system`
- [ ] Rename service thành `gateway`
- [ ] Settings ? Root Directory: `gateway`
- [ ] Variables ? Add:
  ```
  ASPNETCORE_ENVIRONMENT=Production
  ASPNETCORE_URLS=http://+:8080
  JwtSettings__Secret=t4LQRcBnnA6hyucvkz6WJcwzaQA3GtF92bHatyNYh4D7XeJJpKCL
  ```
- [ ] Settings ? Networking ? Generate Domain
- [ ] **L?u l?i Gateway domain** (ví d?: `gateway-production-xxxx.up.railway.app`)

### 7?? Update ocelot.json (quan tr?ng!)

File: `gateway/Ocelot Gateway/ocelot.json`

- [ ] Update t?t c? `DownstreamHostAndPorts` ?? dùng Railway private networking:
  ```json
  {
    "DownstreamHostAndPorts": [
      {
        "Host": "service-node.railway.internal",
        "Port": 5000
      }
    ]
  }
  ```
  
  ```json
  {
    "DownstreamHostAndPorts": [
      {
        "Host": "service-dotnet.railway.internal",
        "Port": 8080
      }
    ]
  }
  ```

- [ ] Commit và push:
  ```bash
  git add gateway/Ocelot\ Gateway/ocelot.json
  git commit -m "Update ocelot.json for Railway private networking"
  git push
  ```

- [ ] Railway s? t? ??ng redeploy gateway

### 8?? Deploy frontend

- [ ] New ? GitHub Repo ? ch?n `url-shorten-system`
- [ ] Rename service thành `frontend`
- [ ] Settings ? Root Directory: `frontend`
- [ ] Variables ? Add:
  ```
  VUE_APP_API_URL=https://[gateway-domain-t?-b??c-6]
  ```
  Ví d?:
  ```
  VUE_APP_API_URL=https://gateway-production-xxxx.up.railway.app
  ```
  
- [ ] Settings ? Networking ? Generate Domain
- [ ] **L?u l?i Frontend domain**

### 9?? Update CORS

Sau khi có domains, update CORS cho phép requests:

**File: `service-node/server.js`**
- [ ] Update corsOptions:
  ```javascript
  const corsOptions = {
      origin: [
          'https://your-frontend.railway.app',
          'https://your-gateway.railway.app',
          'http://localhost:8080'
      ],
      credentials: true
  };
  ```

**File: `service-dotnet/url-shorten-service/Program.cs`**
- [ ] Update CORS policy:
  ```csharp
  options.AddPolicy("AllowAllOrigins",
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
  ```

**File: `gateway/Ocelot Gateway/Program.cs`** (n?u có CORS)
- [ ] Update t??ng t?

- [ ] Commit và push:
  ```bash
  git add .
  git commit -m "Update CORS for Railway domains"
  git push
  ```

### ?? Testing & Verification

- [ ] Check t?t c? services ?ang running (green status)
- [ ] Check logs c?a t?ng service (không có errors)
- [ ] Test frontend URL: `https://your-frontend.railway.app`
- [ ] Test gateway Swagger: `https://your-gateway.railway.app/swagger`
- [ ] Test authentication flow:
  - [ ] Register user
  - [ ] Login
  - [ ] Get JWT token
- [ ] Test URL shortening:
  - [ ] Create short URL
  - [ ] Access short URL
  - [ ] View statistics

---

## ?? Troubleshooting

### Service không start
- [ ] Check logs trong Railway Dashboard
- [ ] Verify environment variables spelling
- [ ] Check Dockerfile syntax
- [ ] Ensure port numbers match

### Database connection failed
- [ ] Verify connection string format
- [ ] Check database service is running
- [ ] Ensure private networking enabled (Settings ? Networking)
- [ ] Verify variable references: `${{ServiceName.VARIABLE}}`

### CORS errors
- [ ] Verify allowed origins include Railway domains
- [ ] Check credentials: true
- [ ] Ensure frontend uses correct API URL

### Build failed
- [ ] Check build logs
- [ ] Verify Dockerfile path
- [ ] Check missing dependencies
- [ ] Ensure proper .dockerignore

### 502 Bad Gateway
- [ ] Check downstream services are running
- [ ] Verify private networking URLs
- [ ] Check ocelot.json configuration

---

## ?? Post-Deployment Monitoring

- [ ] Setup Railway notifications (Settings ? Notifications)
- [ ] Monitor resource usage (Dashboard ? Metrics)
- [ ] Check logs regularly for errors
- [ ] Test all critical user flows
- [ ] Monitor database size and performance

---

## ?? Cost Optimization

Railway free tier: **$5 credit/month**

?? t?i ?u costs:
- [ ] Remove unused services
- [ ] Setup sleep policies for dev environments
- [ ] Monitor usage in Dashboard
- [ ] Consider upgrading if needed

---

## ?? Notes

- M?i l?n push code m?i lên GitHub, Railway t? ??ng rebuild và deploy
- Private networking: `[service-name].railway.internal`
- Public domains có th? custom (v?i domain riêng)
- Logs retention: 7 days on free tier
- Database backups: automatic daily backups

---

## ? Deployment Complete!

Khi t?t c? checklist items hoàn thành:

?? **Chúc m?ng! H? th?ng ?ã ???c deploy thành công lên Railway!**

**Frontend URL**: https://[your-frontend].railway.app
**API Gateway**: https://[your-gateway].railway.app
**Swagger Docs**: https://[your-gateway].railway.app/swagger

---

## ?? References

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Railway Status: https://status.railway.app

## ?? Need Help?

1. Check `RAILWAY_DEPLOYMENT.md` for detailed instructions
2. Check `ENVIRONMENT_VARIABLES.md` for env vars reference  
3. Check `POSTGRESQL_MIGRATION.md` if using PostgreSQL
4. Railway Discord community
5. GitHub Issues c?a repository này
