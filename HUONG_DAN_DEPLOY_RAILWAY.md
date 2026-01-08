# 🚀 HƯỚNG DẪN DEPLOY HỆ THỐNG LÊN RAILWAY - CHI TIẾT TỪNG BƯỚC

## 📋 MỤC LỤC
1. [Giới thiệu](#giới-thiệu)
2. [Chuẩn bị trước khi deploy](#chuẩn-bị-trước-khi-deploy)
3. [Tạo Railway Project](#bước-1-tạo-railway-project)
4. [Thêm Databases](#bước-2-thêm-databases)
5. [Deploy từng Service](#bước-3-deploy-từng-service)
6. [Cấu hình kết nối giữa các services](#bước-4-cấu-hình-kết-nối)
7. [Kiểm tra và test](#bước-5-kiểm-tra-và-test)
8. [Xử lý lỗi thường gặp](#xử-lý-lỗi-thường-gặp)

---

## 📖 GIỚI THIỆU

Hệ thống URL Shortener của bạn gồm **4 services** cần deploy:

```
┌─────────────┐
│  Frontend   │ ← Người dùng truy cập
│  (Vue.js)   │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│   Gateway   │ ← API Gateway (Ocelot)
│  (.NET 8)   │
└──────┬──────┘
       │
       ├─────────────────────┐
       │                     │
       ↓                     ↓
┌──────────────┐      ┌──────────────┐
│ Service-Node │      │Service-DotNet│
│  (Node.js)   │      │   (.NET 8)   │
│              │      │              │
│  + MongoDB   │      │ + PostgreSQL │
└──────────────┘      └──────────────┘
```

**Quan trọng**: Đây là **Monorepo** (1 repo có nhiều services), nên bạn cần:
- Deploy **4 lần** từ **cùng 1 repository**
- Mỗi lần phải set **Root Directory** khác nhau

---

## 🎯 CHUẨN BỊ TRƯỚC KHI DEPLOY

### ✅ Checklist:
- [ ] Có tài khoản Railway (đăng ký tại [railway.app](https://railway.app))
- [ ] Code đã push lên GitHub
- [ ] Đã test local bằng Docker (nếu có thể)
- [ ] Đã đọc hướng dẫn này hết 1 lượt trước

### 📝 Thông tin cần chuẩn bị:
```
Repository URL: https://github.com/[username]/url-shorten-system
JWT_SECRET: t4LQRcBnnA6hyucvkz6WJcwzaQA3GtF92bHatyNYh4D7XeJJpKCL
```

---

## 🏗️ BƯỚC 1: TẠO RAILWAY PROJECT

### 1.1 Tạo Project mới
1. Truy cập: [https://railway.app](https://railway.app)
2. Đăng nhập bằng GitHub
3. Click nút **"New Project"** (góc trên bên phải)
4. Chọn **"Empty Project"** (tạo project trống)
5. Đặt tên project: `URL Shortener System`

> 💡 **Tại sao tạo Empty Project?** 
> Vì chúng ta cần thêm databases trước, sau đó mới deploy các services.

### 1.2 Giao diện Project
Sau khi tạo xong, bạn sẽ thấy:
- Canvas trống (nơi hiển thị các services)
- Nút **"+ New"** để thêm services/databases

---

## 💾 BƯỚC 2: THÊM DATABASES

### 2.1 Thêm MongoDB

**Tại sao cần MongoDB?**  
Service-Node (authentication) dùng MongoDB để lưu thông tin users.

**Các bước:**
1. Click nút **"+ New"**
2. Chọn **"Database"** → **"Add MongoDB"**
3. Đợi ~30 giây để Railway khởi tạo
4. Khi thấy status = **"Active"** (màu xanh) → OK

**Lưu ý:**
- Railway tự động tạo biến `MONGO_URL`
- Bạn không cần copy connection string thủ công
- Service-Node sẽ tự động nhận được biến này

### 2.2 Thêm PostgreSQL

**Tại sao cần PostgreSQL?**  
Service-DotNet (URL shortener) dùng PostgreSQL để lưu URLs đã rút gọn.

**Các bước:**
1. Click nút **"+ New"**
2. Chọn **"Database"** → **"Add PostgreSQL"**
3. Đợi ~30 giây để Railway khởi tạo
4. Khi thấy status = **"Active"** → OK

**Lưu ý:**
- Railway tự động tạo biến `DATABASE_URL`
- Format: `postgresql://user:pass@host:port/dbname`

### ✅ Checkpoint 1:
Bây giờ trên canvas bạn phải thấy:
```
[MongoDB] [PostgreSQL]
  (Active)  (Active)
```

---

## 🚢 BƯỚC 3: DEPLOY TỪNG SERVICE

> ⚠️ **QUAN TRỌNG**: Deploy theo đúng thứ tự sau:
> 1. Service-Node (Auth)
> 2. Service-DotNet (URL)
> 3. Gateway
> 4. Frontend

---

### 3.1 DEPLOY SERVICE-NODE (Authentication Service)

#### Bước 1: Kết nối GitHub Repository

1. Click **"+ New"**
2. Chọn **"GitHub Repo"**
3. Nếu lần đầu:
   - Click **"Configure GitHub App"**
   - Authorize Railway truy cập repo của bạn
   - Chọn repository: `url-shorten-system`
4. Nếu đã authorize rồi:
   - Chọn trực tiếp repository: `url-shorten-system`

5. Railway sẽ tạo service mới (tên mặc định: `url-shorten-system`)

#### Bước 2: Đổi tên và cấu hình Service ⭐ QUAN TRỌNG

1. Click vào service vừa tạo (hình chữ nhật trên canvas)
2. Đi đến tab **"Settings"** (icon bánh răng)
3. Tìm mục **"Service Name"**:
   - Đổi từ `url-shorten-system` → `service-node`
   - Click **"✓"** để lưu

4. Scroll xuống mục **"Source"**
5. Tìm **"Root Directory"**:
   - Click **"Configure"** hoặc **"/"**
   - Nhập: `/service-node` (có dấu `/` ở đầu)
   - Click **"✓"** để lưu

> 🔴 **LƯU Ý CỰC KỲ QUAN TRỌNG:**
> - Root Directory PHẢI có dấu `/` ở đầu: `/service-node`
> - Không có `/` → Railway sẽ báo lỗi không tìm thấy Dockerfile
> - Phân biệt chữ hoa/thường (case-sensitive)

#### Bước 3: Thêm Environment Variables

1. Đi đến tab **"Variables"** (icon 🔧)
2. Click **"+ New Variable"**
3. Thêm từng biến sau:

**Biến 1:**
```
Name:  PORT
Value: 5000
```

**Biến 2:**
```
Name:  NODE_ENV
Value: production
```

**Biến 3:**
```
Name:  JWT_SECRET
Value: t4LQRcBnnA6hyucvkz6WJcwzaQA3GtF92bHatyNYh4D7XeJJpKCL
```

**Biến 4 (Reference MongoDB):**
```
Name:  MONGODB_URI
Value: ${{MongoDB.MONGO_URL}}
```

> 💡 **Giải thích biến thứ 4:**
> - `${{MongoDB.MONGO_URL}}` là cú pháp đặc biệt của Railway
> - Railway sẽ tự động thay thế bằng connection string thật
> - `MongoDB` là tên service database bạn tạo ở bước 2.1

**Cách thêm biến:**
- Click **"+ New Variable"**
- Nhập Name và Value
- Click **"Add"**
- Lặp lại cho tất cả các biến

#### Bước 4: Deploy

1. Railway sẽ **tự động trigger build** sau khi bạn lưu settings
2. Đi đến tab **"Deployments"** để xem tiến trình
3. Bạn sẽ thấy:
   ```
   Building... → Deploying... → Success ✓
   ```
4. Quá trình build mất ~2-5 phút

**Theo dõi logs:**
- Click vào deployment đang chạy
- Xem logs real-time
- Tìm dòng: `Server is running on port 5000` → OK

#### Bước 5: Generate Domain (Public URL)

1. Vẫn ở trong service `service-node`
2. Đi đến tab **"Settings"**
3. Scroll xuống mục **"Networking"**
4. Click **"Generate Domain"**
5. Railway sẽ tạo URL dạng: `service-node.up.railway.app`

> 📌 **Lưu lại URL này**, bạn sẽ cần dùng để test sau.

### ✅ Checkpoint 2:
```
✓ Service-Node: Deployed, Active, có Public Domain
✓ MongoDB: Connected
✓ Logs: "Server is running on port 5000"
```

---

### 3.2 DEPLOY SERVICE-DOTNET (URL Shortener Service)

> ⚠️ **LƯU Ý VỀ DATABASE MIGRATION:**  
> Service này dùng Entity Framework Core và cần **tự động chạy migrations** khi deploy.  
> Code đã được config sẵn để auto-migrate, bạn không cần làm gì thủ công!

#### Bước 0: Verify Auto-Migration (Đã có sẵn trong code)

File `service-dotnet/url-shorten-service/Program.cs` phải có đoạn code này:

```csharp
// Tự động apply migrations khi app start
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<url_shorten_serviceContext>();
    dbContext.Database.Migrate(); // Tự động tạo tables nếu chưa có
}
```

> 💡 **Nếu chưa có đoạn code trên**, xem phần **"Bổ sung: Cấu hình Auto-Migration"** ở cuối hướng dẫn.

#### Bước 1: Thêm service mới từ GitHub

1. **Quay lại Project Canvas** (click logo Railway hoặc Project name)
2. Click **"+ New"**
3. Chọn **"GitHub Repo"**
4. Chọn **CÙNG repository**: `url-shorten-system`
   - Đúng rồi, chọn lại cùng repo!
   - Railway cho phép deploy nhiều services từ 1 repo

5. Railway sẽ tạo service thứ 2 (tên: `url-shorten-system`)

#### Bước 2: Đổi tên và cấu hình Service

1. Click vào service mới
2. Tab **"Settings"**:
   - **Service Name**: Đổi thành `service-dotnet`
   
3. Mục **"Source"** → **"Root Directory"**:
   - Nhập: `/service-dotnet`
   - Lưu lại

> ⚠️ Nhớ có dấu `/` ở đầu nhé!

#### Bước 3: Thêm Environment Variables

Tab **"Variables"**, thêm các biến sau:

**Biến 1-2: ASP.NET Core config**
```
Name:  ASPNETCORE_ENVIRONMENT
Value: Production

Name:  ASPNETCORE_URLS
Value: http://+:8080
```

**Biến 3-5: JWT Settings**
```
Name:  JwtSettings__Secret
Value: t4LQRcBnnA6hyucvkz6WJcwzaQA3GtF92bHatyNYh4D7XeJJpKCL

Name:  JwtSettings__ExpiryMinutes
Value: 1440

Name:  JwtSettings__Issuer
Value: UrlShortener
```

> 💡 **Lưu ý**: Dùng `__` (2 dấu gạch dưới) để tạo nested config trong .NET

**Biến 6: Database Connection**
```
Name:  ConnectionStrings__url_shorten_serviceContext
Value: ${{Postgres.DATABASE_URL}}
```

> 📝 Giải thích:
> - `Postgres` là tên service PostgreSQL bạn tạo ở bước 2.2
> - Railway tự thay thế bằng connection string thật

#### Bước 4: Deploy

1. Railway auto-trigger build
2. Tab **"Deployments"** → theo dõi
3. Đợi ~3-7 phút (build .NET lâu hơn Node.js)
4. Thấy **"Success ✓"** → OK

**Kiểm tra logs:**
- Tìm dòng: `Applying migration '20250411072501_First migration'` (migrations đang chạy)
- Tìm dòng: `Now listening on: http://[::]:8080`
- Không có errors → OK

> ✅ Nếu thấy dòng "Applying migration..." → Database migrations đã tự động chạy thành công!

#### Bước 5: Generate Domain

1. Settings → Networking → **"Generate Domain"**
2. Lưu lại URL: `service-dotnet.up.railway.app`

### ✅ Checkpoint 3:
```
✓ Service-Node: Active
✓ Service-DotNet: Active, có Public Domain
✓ PostgreSQL: Connected
```

---

### 3.3 DEPLOY GATEWAY (Ocelot API Gateway)

#### Bước 1: Thêm service từ GitHub

1. Quay lại Project Canvas
2. **"+ New"** → **"GitHub Repo"** → `url-shorten-system`

#### Bước 2: Cấu hình Service

1. **Service Name**: `gateway`
2. **Root Directory**: `/gateway`

#### Bước 3: Thêm Environment Variables

```
Name:  ASPNETCORE_ENVIRONMENT
Value: Production

Name:  ASPNETCORE_URLS
Value: http://+:8080

Name:  JwtSettings__Secret
Value: t4LQRcBnnA6hyucvkz6WJcwzaQA3GtF92bHatyNYh4D7XeJJpKCL
```

#### Bước 4: Cập nhật file ocelot.json ⭐ QUAN TRỌNG

> 🔴 **PHẢI LÀM BƯỚC NÀY** để Gateway biết cách gọi các services khác!

**Lấy Private URLs của các services:**

Railway có 2 loại URLs:
- **Public Domain**: `service-node.up.railway.app` (truy cập từ internet)
- **Private Network**: `service-node.railway.internal` (chỉ các services trong project gọi nhau)

**Tại sao dùng Private Network?**
- Nhanh hơn (không qua internet)
- Bảo mật hơn
- Miễn phí bandwidth

**Cách cập nhật:**

1. Mở file: `gateway/Ocelot Gateway/ocelot.json`
2. Tìm mục `DownstreamHostAndPorts`
3. Thay đổi như sau:

**Cho Service-Node (Auth):**
```json
{
  "DownstreamPathTemplate": "/api/auth/{everything}",
  "DownstreamScheme": "http",
  "DownstreamHostAndPorts": [
    {
      "Host": "service-node.railway.internal",
      "Port": 5000
    }
  ],
  ...
}
```

**Cho Service-DotNet (URLs):**
```json
{
  "DownstreamPathTemplate": "/api/urls/{everything}",
  "DownstreamScheme": "http",
  "DownstreamHostAndPorts": [
    {
      "Host": "service-dotnet.railway.internal",
      "Port": 8080
    }
  ],
  ...
}
```

> 💡 **Quy tắc Private Network của Railway:**
> - Format: `<service-name>.railway.internal`
> - Service name lấy từ Settings → Service Name
> - Port là port mà service đang listen (5000, 8080, ...)

4. **Commit và push lên GitHub:**
```powershell
git add gateway/Ocelot\ Gateway/ocelot.json
git commit -m "Update ocelot.json for Railway deployment"
git push
```

5. Quay lại Railway, service `gateway` sẽ tự rebuild

#### Bước 5: Generate Domain

1. Settings → Networking → **"Generate Domain"**
2. Lưu URL: `gateway.up.railway.app`

> 📌 **URL này rất quan trọng**, Frontend sẽ gọi API qua đây!

### ✅ Checkpoint 4:
```
✓ Service-Node: Active
✓ Service-DotNet: Active
✓ Gateway: Active, có Public Domain, đã config ocelot.json
```

---

### 3.4 DEPLOY FRONTEND (Vue.js)

#### Bước 1: Thêm service từ GitHub

1. **"+ New"** → **"GitHub Repo"** → `url-shorten-system`

#### Bước 2: Cấu hình Service

1. **Service Name**: `frontend`
2. **Root Directory**: `/frontend`

#### Bước 3: Thêm Environment Variables

```
Name:  VUE_APP_API_URL
Value: https://gateway.up.railway.app
```

> 🔴 **THAY `gateway.up.railway.app` bằng domain thật của Gateway bạn!**
> - Copy từ Gateway Settings → Networking → Public Domain
> - Thêm `https://` vào đầu

#### Bước 4: Deploy

1. Railway auto-build
2. Đợi ~3-5 phút
3. Check logs → Tìm: `Server is ready`

#### Bước 5: Generate Domain

1. Settings → Networking → **"Generate Domain"**
2. Lưu URL: `frontend.up.railway.app`

> 🎉 **ĐÂY LÀ URL CHÍNH** để người dùng truy cập ứng dụng!

### ✅ Checkpoint 5:
```
✓ Service-Node: Active
✓ Service-DotNet: Active  
✓ Gateway: Active
✓ Frontend: Active, có Public Domain
✓ Tổng cộng: 6 services (2 DBs + 4 apps)
```

---

## 🔗 BƯỚC 4: CẤU HÌNH KẾT NỐI

### 4.1 Kiểm tra Railway Private Networking

Railway tự động kích hoạt Private Network giữa các services trong cùng 1 project.

**Verify:**
1. Vào bất kỳ service nào
2. Tab **"Settings"** → **"Networking"**
3. Phải thấy mục **"Private Network"**:
   ```
   service-node.railway.internal
   ```

> ✅ Nếu thấy → OK, không cần làm gì thêm

### 4.2 Cập nhật Frontend nếu cần

Nếu bạn chưa set `VUE_APP_API_URL` đúng:

1. Vào service `frontend`
2. Tab **"Variables"**
3. Sửa `VUE_APP_API_URL`:
   ```
   https://gateway-production-xxxx.up.railway.app
   ```
4. Click **"Deploy"** để redeploy

---

## ✅ BƯỚC 5: KIỂM TRA VÀ TEST

### 5.1 Test từng service riêng lẻ

#### Test Service-Node (Auth):
```bash
# Health check
curl https://service-node.up.railway.app/api/auth/health

# Đăng ký user mới
curl -X POST https://service-node.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","username":"testuser"}'
```

**Kết quả mong đợi:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "email": "test@example.com", ... }
}
```

#### Test Service-DotNet (URL):

Trước tiên, lấy token từ bước trên, sau đó:

```bash
# Tạo short URL
curl -X POST https://service-dotnet.up.railway.app/api/urls \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"originalUrl":"https://www.google.com"}'
```

#### Test Gateway:

```bash
# Qua gateway
curl https://gateway.up.railway.app/api/auth/health
```

### 5.2 Test toàn bộ hệ thống qua Frontend

1. Mở browser
2. Truy cập: `https://frontend.up.railway.app`
3. Thử các chức năng:
   - ✅ Đăng ký tài khoản
   - ✅ Đăng nhập
   - ✅ Tạo short URL
   - ✅ Xem danh sách URLs
   - ✅ Click vào short URL → redirect đúng

### 5.3 Kiểm tra Logs

Nếu có lỗi, check logs của từng service:

1. Click vào service
2. Tab **"Deployments"**
3. Click vào deployment hiện tại
4. Xem **"Build Logs"** và **"Deploy Logs"**

**Tìm kiếm:**
- ❌ Dòng chứa `ERROR`, `Exception`, `Failed`
- ✅ Dòng chứa `listening on`, `started`, `connected to database`

---

## 🛠️ XỬ LÝ LỖI THƯỜNG GẶP

### Lỗi 1: "Could not determine how to build the app"

**Nguyên nhân:** Chưa set Root Directory

**Giải pháp:**
1. Vào Settings → Source → Root Directory
2. Nhập: `/service-node` (nhớ dấu `/`)
3. Redeploy

---

### Lỗi 2: "Connection refused" hoặc "ECONNREFUSED"

**Nguyên nhân:** Service chưa sẵn sàng hoặc wrong port

**Giải pháp:**
1. Check service status → phải là "Active"
2. Check logs → tìm dòng "listening on port X"
3. Verify biến môi trường `PORT` (service-node) hoặc `ASPNETCORE_URLS` (.NET)

---

### Lỗi 3: "Cannot connect to database"

**Nguyên nhân:** Sai connection string hoặc DB chưa ready

**Giải pháp:**
1. Check MongoDB/PostgreSQL status → phải "Active"
2. Verify biến:
   - `MONGODB_URI=${{MongoDB.MONGO_URL}}`
   - `ConnectionStrings__url_shorten_serviceContext=${{Postgres.DATABASE_URL}}`
3. Kiểm tra tên service database (phân biệt hoa/thường)

---

### Lỗi 4: Gateway trả về 502 Bad Gateway

**Nguyên nhân:** Gateway không gọi được backend services

**Giải pháp:**
1. Check `ocelot.json`:
   ```json
   "Host": "service-node.railway.internal"  ← Phải có .railway.internal
   "Port": 5000  ← Đúng port
   ```
2. Verify service names khớp với Settings → Service Name
3. Redeploy gateway sau khi sửa

---

### Lỗi 5: Frontend gọi API bị CORS error

**Nguyên nhân:** Gateway/Backend chưa config CORS

**Giải pháp:**
1. Check Gateway có cho phép origin của Frontend không
2. Trong .NET services, verify `Program.cs`:
   ```csharp
   app.UseCors(builder => builder
       .AllowAnyOrigin()
       .AllowAnyMethod()
       .AllowAnyHeader());
   ```

---

### Lỗi 6: Frontend hiển thị "Cannot connect to API"

**Nguyên nhân:** Sai `VUE_APP_API_URL`

**Giải pháp:**
1. Frontend → Variables → Check `VUE_APP_API_URL`
2. Phải là: `https://gateway.up.railway.app` (KHÔNG có `/` cuối)
3. Phải có `https://`
4. Redeploy frontend

---

### Lỗi 7: "Out of memory" / "Build failed"

**Nguyên nhân:** Railway free tier có giới hạn RAM

**Giải pháp:**
1. Optimize Dockerfile:
   - Dùng multi-stage build
   - Xóa cache sau khi cài packages
2. Nếu cần thiết: Upgrade Railway plan

---

## 📊 TỔNG KẾT CẤU HÌNH

### Danh sách Services trên Railway:

| Service | Root Directory | Public Domain | Private Network |
|---------|---------------|---------------|-----------------|
| MongoDB | - | ❌ | `mongodb.railway.internal` |
| PostgreSQL | - | ❌ | `postgres.railway.internal` |
| service-node | `/service-node` | ✅ | `service-node.railway.internal:5000` |
| service-dotnet | `/service-dotnet` | ✅ | `service-dotnet.railway.internal:8080` |
| gateway | `/gateway` | ✅ | `gateway.railway.internal:8080` |
| frontend | `/frontend` | ✅ | - |

### Environment Variables - Tóm tắt:

**Service-Node:**
```env
PORT=5000
NODE_ENV=production
JWT_SECRET=t4LQRcBnnA6hyucvkz6WJcwzaQA3GtF92bHatyNYh4D7XeJJpKCL
MONGODB_URI=${{MongoDB.MONGO_URL}}
```

**Service-DotNet:**
```env
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:8080
JwtSettings__Secret=t4LQRcBnnA6hyucvkz6WJcwzaQA3GtF92bHatyNYh4D7XeJJpKCL
JwtSettings__ExpiryMinutes=1440
JwtSettings__Issuer=UrlShortener
ConnectionStrings__url_shorten_serviceContext=${{Postgres.DATABASE_URL}}
```

**Gateway:**
```env
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:8080
JwtSettings__Secret=t4LQRcBnnA6hyucvkz6WJcwzaQA3GtF92bHatyNYh4D7XeJJpKCL
```

**Frontend:**
```env
VUE_APP_API_URL=https://[GATEWAY_DOMAIN]
```

---

## 🎯 CHECKLIST CUỐI CÙNG

Trước khi thông báo "Đã deploy xong":

- [ ] Tất cả 6 services đều status "Active" (màu xanh)
- [ ] Không có deployment nào "Failed" (màu đỏ)
- [ ] Gateway có Public Domain và đã config `ocelot.json`
- [ ] Frontend có Public Domain
- [ ] Frontend Variables có `VUE_APP_API_URL` đúng
- [ ] Test đăng ký user thành công
- [ ] Test đăng nhập thành công
- [ ] Test tạo short URL thành công
- [ ] Test click vào short URL → redirect đúng

---

## 🚀 NEXT STEPS

Sau khi deploy thành công:

1. **Custom Domain** (optional):
   - Railway Settings → Custom Domain
   - Thêm domain riêng của bạn
   - Update DNS records

2. **Monitoring:**
   - Railway tự động có metrics (CPU, RAM, Network)
   - Check tab "Metrics" của từng service

3. **Logs:**
   - Railway lưu logs 7 ngày (free tier)
   - Download logs nếu cần debug

4. **Auto-deploy:**
   - Railway đã tự động setup
   - Mỗi lần push code lên GitHub → auto rebuild

5. **Backup:**
   - Databases không tự backup (free tier)
   - Cân nhắc export data định kỳ

---

## 📞 HỖ TRỢ

**Nếu gặp vấn đề:**

1. Check lại từng bước trong hướng dẫn này
2. Xem mục "Xử lý lỗi thường gặp"
3. Đọc logs kỹ càng (90% lỗi có hint trong logs)
4. Railway Discord: [discord.gg/railway](https://discord.gg/railway)
5. Railway Docs: [docs.railway.app](https://docs.railway.app)

---

## ✅ HOÀN THÀNH!

Nếu bạn đã làm đến đây và mọi thứ hoạt động → Chúc mừng! 🎉

Hệ thống của bạn đã chạy trên Railway với:
- ✅ High Availability
- ✅ Auto-scaling
- ✅ HTTPS enabled
- ✅ Auto-deploy from GitHub
- ✅ Private networking giữa các services

**URL của bạn:** `https://frontend-production-xxxx.up.railway.app`

Chia sẻ với bạn bè và tận hưởng! 🚀

---

## 🔧 BỔ SUNG: CẤU HÌNH AUTO-MIGRATION

### Tại sao cần Auto-Migration?

**MongoDB (service-node):**
- ✅ Không cần migration vì là NoSQL, schema-less
- ✅ Mongoose tự động tạo collections khi cần

**PostgreSQL (service-dotnet):**
- ❌ Cần migrations để tạo tables
- ❌ Code có migrations sẵn (trong folder `Migrations/`)
- ✅ Nên config auto-migrate để Railway tự chạy khi deploy

### Cách thêm Auto-Migration vào service-dotnet:

**File:** `service-dotnet/url-shorten-service/Program.cs`

**Tìm dòng:**
```csharp
var app = builder.Build();
```

**Thêm ngay sau dòng đó:**
```csharp
var app = builder.Build();

// ========== THÊM ĐOẠN NÀY ==========
// Tự động apply migrations khi app khởi động
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var dbContext = services.GetRequiredService<url_shorten_serviceContext>();
        
        // Apply tất cả pending migrations
        dbContext.Database.Migrate();
        
        Console.WriteLine("✅ Database migrations applied successfully!");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ Error during migration: {ex.Message}");
        throw; // Dừng app nếu migration fail
    }
}
// ====================================

// Cấu hình pipeline HTTP request
if (app.Environment.IsDevelopment())
{
```

### Lợi ích của Auto-Migration:

✅ **Tự động**: Không cần chạy `dotnet ef database update` thủ công  
✅ **An toàn**: Railway sẽ tự migrate mỗi lần deploy  
✅ **Dễ debug**: Có logs rõ ràng nếu migration fail  
✅ **Production-ready**: Best practice cho cloud deployment

### Khi nào migrations chạy?

- ✅ Lần đầu deploy → Tạo tất cả tables từ đầu
- ✅ Mỗi lần deploy code mới → Apply migrations mới (nếu có)
- ✅ Restart service → Check và apply nếu thiếu migrations

### Verify migrations đã chạy:

**Cách 1: Check logs**
```
Railway → service-dotnet → Deployments → Click deployment mới nhất
Tìm dòng: "✅ Database migrations applied successfully!"
```

**Cách 2: Test API**
```bash
# Nếu migrations OK, API này sẽ hoạt động (không bị lỗi "table not found")
curl -X POST https://service-dotnet.up.railway.app/api/urls \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"originalUrl":"https://google.com"}'
```

### Lưu ý quan trọng:

> ⚠️ **Migrations chạy TRƯỚC KHI app start**  
> Nếu migration fail → App không khởi động → Deploy status = Failed

> 💡 **Migrations là idempotent**  
> Chạy nhiều lần cũng OK, EF Core tự check migrations nào đã apply rồi

> 🔴 **Production warning**  
> Trong môi trường thật, nên review migrations trước khi deploy để tránh mất data
