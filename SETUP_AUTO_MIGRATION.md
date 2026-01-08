# 🔧 Setup Auto-Migration cho PostgreSQL

## Tóm tắt nhanh

**MongoDB (service-node):** ✅ Không cần làm gì - tự động hoạt động

**PostgreSQL (service-dotnet):** ⚠️ CẦN thêm auto-migration để tự động tạo tables khi deploy lên Railway

---

## Bước 1: Thêm code vào Program.cs

**File:** `service-dotnet/url-shorten-service/Program.cs`

### Tìm đoạn code này:

```csharp
var app = builder.Build();

// Cấu hình pipeline HTTP request
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
```

### Sửa thành:

```csharp
var app = builder.Build();

// ========== THÊM AUTO-MIGRATION ==========
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var dbContext = services.GetRequiredService<url_shorten_serviceContext>();
        dbContext.Database.Migrate(); // Tự động apply migrations
        Console.WriteLine("✅ Database migrations applied successfully!");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ Migration error: {ex.Message}");
        throw;
    }
}
// ==========================================

// Cấu hình pipeline HTTP request
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
```

---

## Bước 2: Commit và push

```powershell
git add service-dotnet/url-shorten-service/Program.cs
git commit -m "Add auto-migration for PostgreSQL on Railway"
git push
```

---

## Bước 3: Verify trên Railway

Sau khi Railway rebuild `service-dotnet`:

1. Vào **Deployments** tab
2. Click vào deployment mới nhất
3. Xem logs, tìm dòng:
   ```
   ✅ Database migrations applied successfully!
   ```

Nếu thấy → Migrations đã chạy thành công! 🎉

---

## Tại sao cần làm vậy?

| Trước (Không auto-migrate) | Sau (Có auto-migrate) |
|----------------------------|----------------------|
| ❌ Phải chạy `dotnet ef database update` thủ công | ✅ Tự động khi deploy |
| ❌ Dễ quên khi deploy code mới | ✅ Không bao giờ quên |
| ❌ Lỗi "table not found" khi chưa migrate | ✅ Luôn có đầy đủ tables |
| ❌ Khó khăn trên Railway (không có CLI access) | ✅ Hoàn toàn tự động |

---

## Khi nào migrations chạy?

✅ **Lần đầu deploy:** Tạo tất cả tables từ migrations có sẵn  
✅ **Deploy code mới:** Apply thêm migrations mới (nếu có)  
✅ **Restart service:** Check và apply nếu thiếu migrations  

---

## Xử lý lỗi migration

Nếu thấy logs:
```
❌ Migration error: ...
```

**Check:**
1. Connection string đúng chưa? → Xem `ConnectionStrings__url_shorten_serviceContext` trong Variables
2. PostgreSQL database đã active chưa? → Check database status
3. Migrations có lỗi syntax không? → Review code trong folder `Migrations/`

**Fix:**
1. Sửa lỗi trong code
2. Commit & push
3. Railway tự rebuild

---

## ✅ Done!

Sau bước này, service-dotnet sẽ tự động:
- Tạo database schema
- Apply tất cả migrations
- Sẵn sàng nhận requests

Không cần làm gì thêm! 🚀
