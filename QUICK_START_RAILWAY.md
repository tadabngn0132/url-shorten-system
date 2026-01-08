# Quick Start: Deploy to Railway

## ?? Checklist tr??c khi deploy

- [ ] Account Railway ?ã t?o
- [ ] Repository ?ã push lên GitHub
- [ ] ?ã ??c `RAILWAY_DEPLOYMENT.md`
- [ ] ?ã chu?n b? các bi?n môi tr??ng

## ?? Các b??c deploy nhanh

### 1. T?o Railway Project
```
1. Vào railway.app
2. Click "New Project"
3. Ch?n "Deploy from GitHub repo"
4. Authorize và ch?n repo: url-shorten-system
```

### 2. Thêm Databases
```
- Click "+ New" ? Database ? MongoDB
- Click "+ New" ? Database ? PostgreSQL (n?u không dùng SQL Server)
```

### 3. Deploy Services (theo th? t?)

#### Service 1: service-node
```
Root Directory: service-node
Bi?n môi tr??ng:
  - PORT=5000
  - MONGODB_URI=${{MongoDB.MONGO_URL}}
  - JWT_SECRET=t4LQRcBnnA6hyucvkz6WJcwzaQA3GtF92bHatyNYh4D7XeJJpKCL
  - NODE_ENV=production
```

#### Service 2: service-dotnet
```
Root Directory: service-dotnet
Bi?n môi tr??ng:
  - ASPNETCORE_ENVIRONMENT=Production
  - ASPNETCORE_URLS=http://+:8080
  - ConnectionStrings__url_shorten_serviceContext=${{Postgres.DATABASE_URL}}
  - JwtSettings__Secret=t4LQRcBnnA6hyucvkz6WJcwzaQA3GtF92bHatyNYh4D7XeJJpKCL
```

#### Service 3: gateway
```
Root Directory: gateway
Bi?n môi tr??ng:
  - ASPNETCORE_ENVIRONMENT=Production
  - ASPNETCORE_URLS=http://+:8080
  - JwtSettings__Secret=t4LQRcBnnA6hyucvkz6WJcwzaQA3GtF92bHatyNYh4D7XeJJpKCL
```

#### Service 4: frontend
```
Root Directory: frontend
Bi?n môi tr??ng:
  - VUE_APP_API_URL=https://[gateway-domain].railway.app
```

### 4. Generate Public Domains
```
1. Vào Settings c?a "gateway" service
2. Tab "Networking" ? Generate Domain
3. Copy domain (vd: gateway-production-xxxx.up.railway.app)
4. Vào Settings c?a "frontend" service
5. Generate Domain cho frontend
```

### 5. Update ocelot.json (n?u c?n)
C?p nh?t downstream URLs trong gateway ?? dùng private networking:
```json
{
  "Host": "service-node.railway.internal",
  "Port": 5000
}
```

### 6. Ki?m tra Deployment
```
? Check logs c?a t?ng service (không có error)
? Test endpoint: https://[gateway-domain]/swagger
? Test frontend: https://[frontend-domain]
```

## ?? Troubleshooting nhanh

### Build failed
- Check logs trong Railway dashboard
- Verify Dockerfile path
- Ensure all dependencies in package.json/csproj

### Service crashed
- Check environment variables
- Verify database connections
- Review application logs

### CORS errors
- Update allowed origins v?i Railway domains
- Redeploy sau khi update CORS

## ?? Tài li?u chi ti?t

- `RAILWAY_DEPLOYMENT.md` - H??ng d?n ??y ??
- `ENVIRONMENT_VARIABLES.md` - Chi ti?t v? env vars
- M?i service có `Dockerfile` và `railway.json`

## ?? Chi phí

Railway free tier:
- $5 credit/month
- ~500 hours usage
- ?? cho testing và small projects

## ?? C?n h? tr??

1. Check Railway docs: https://docs.railway.app
2. Railway Discord: https://discord.gg/railway
3. Check logs trong Dashboard

---

**L?u ý quan tr?ng:**
- SQL Server không có s?n trên Railway ? Khuy?n ngh? chuy?n sang PostgreSQL
- M?i l?n thay ??i code và push lên GitHub, Railway s? t? ??ng redeploy
- Private networking gi?a các services: `[service-name].railway.internal`
