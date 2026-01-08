# Debug Frontend trên Railway

## Các bước kiểm tra khi gặp lỗi "Application failed to respond"

### 1. Kiểm tra Build Logs
1. Vào Railway Dashboard → Frontend service
2. Click vào tab **"Deployments"**
3. Click vào deployment mới nhất
4. Xem **Build Logs** và **Deploy Logs**

**Tìm kiếm:**
- ✅ `Build successful` hoặc `Docker build completed`
- ❌ `npm ERR!` - lỗi khi build Vue
- ❌ `COPY failed` - lỗi copy file

### 2. Kiểm tra Environment Variables
Vào tab **"Variables"** của Frontend service, đảm bảo có:

```
VUE_APP_API_BASE_URL=https://your-gateway-url.up.railway.app
```

**Quan trọng:**
- ✅ Tên biến: `VUE_APP_API_BASE_URL` (KHÔNG phải VUE_APP_API_URL)
- ✅ Có `https://` ở đầu
- ✅ URL là của Gateway service (không phải frontend)

**Cách lấy Gateway URL:**
1. Vào Gateway service
2. Tab "Settings" → "Networking"
3. Copy "Public Networking" URL

### 3. Kiểm tra Service Settings

#### a) Root Directory
- Vào **Settings** → **Source**
- Đảm bảo **Root Directory** = `frontend`

#### b) Exposed Port
- Vào **Settings** → **Networking**
- Click **"Generate Domain"** nếu chưa có public domain
- Railway sẽ tự động expose port từ Dockerfile (port 80)

### 4. Kiểm tra Deployment Status

Vào tab **"Deployments"**, xem status:
- ✅ **Active** = service đang chạy
- ❌ **Failed** = build/deploy thất bại
- ⏸️ **Crashed** = service start rồi bị crash

### 5. Xem Runtime Logs

1. Click vào **"View Logs"** ở góc trên bên phải
2. Chọn **"Deploy Logs"** 

**Tìm kiếm các dòng:**
```
Starting nginx...
nginx: [emerg] ...  ← LỖI CONFIG
```

### 6. Thử Health Check

Sau khi deploy, thử truy cập:
```
https://your-frontend-url.up.railway.app/health
```

Nếu thấy "OK" → Nginx đang chạy ✅
Nếu timeout → Service không start được ❌

### 7. Force Rebuild

Nếu các bước trên đều OK nhưng vẫn lỗi:

1. Vào **Settings** → **Deployment**
2. Scroll xuống dưới
3. Click **"Redeploy"**
4. Hoặc push 1 commit nhỏ lên GitHub để trigger rebuild

### 8. Kiểm tra CORS (nếu frontend hiện nhưng không gọi được API)

Nếu frontend mở được nhưng báo lỗi CORS khi gọi API:

**Vào Gateway service**, kiểm tra có CORS middleware chưa:

```csharp
// Program.cs của Gateway
app.UseCors(policy => policy
    .AllowAnyOrigin()
    .AllowAnyMethod()
    .AllowAnyHeader());
```

## Common Issues & Solutions

### Issue 1: "npm install" failed
**Nguyên nhân:** Dependencies không tương thích

**Giải pháp:** Kiểm tra lại package.json, có thể cần update hoặc lock versions

### Issue 2: Build timeout
**Nguyên nhân:** Railway free tier có giới hạn build time

**Giải pháp:** 
- Tối ưu dependencies
- Dùng .dockerignore để bỏ node_modules

### Issue 3: Port binding error
**Nguyên nhân:** Railway không detect được port

**Giải pháp:**
- Đảm bảo Dockerfile có `EXPOSE 80`
- Nginx phải `listen 80`

### Issue 4: Static files 404
**Nguyên nhân:** Build path sai hoặc nginx config sai

**Giải pháp:**
- Kiểm tra `npm run build` tạo folder `dist`
- Nginx root phải trỏ đúng `/usr/share/nginx/html`

## Nếu vẫn không được

Gửi screenshots của:
1. Build Logs (toàn bộ)
2. Deploy Logs (toàn bộ)
3. Environment Variables
4. Service Settings
