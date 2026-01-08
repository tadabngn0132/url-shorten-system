# Migration Guide: SQL Server to PostgreSQL for Railway

Railway không h? tr? SQL Server native. H??ng d?n này giúp b?n migrate t? SQL Server sang PostgreSQL.

## Option 1: S? d?ng PostgreSQL trên Railway (Khuy?n ngh?)

### B??c 1: Update NuGet Packages

Trong file `service-dotnet/url-shorten-service/url-shorten-service.csproj`:

**Xóa:**
```xml
<PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="8.0.11" />
```

**Thêm:**
```xml
<PackageReference Include="Npgsql.EntityFrameworkCore.PostgreSQL" Version="8.0.11" />
```

### B??c 2: Update Program.cs

File: `service-dotnet/url-shorten-service/Program.cs`

**Thay ??i t?:**
```csharp
builder.Services.AddDbContext<url_shorten_serviceContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("url_shorten_serviceContext")));
```

**Sang:**
```csharp
builder.Services.AddDbContext<url_shorten_serviceContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("url_shorten_serviceContext")));
```

**Thêm using:**
```csharp
using Npgsql.EntityFrameworkCore.PostgreSQL;
```

### B??c 3: Update Connection String

Railway PostgreSQL cung c?p connection string format:
```
postgresql://user:password@host:port/database
```

Trong Railway Variables, set:
```
ConnectionStrings__url_shorten_serviceContext=${{Postgres.DATABASE_URL}}
```

### B??c 4: Regenerate Migrations

```bash
cd service-dotnet/url-shorten-service

# Remove old migrations
Remove-Item -Recurse -Force Migrations

# Create new migration for PostgreSQL
dotnet ef migrations add InitialCreate

# Apply to database
dotnet ef database update
```

### B??c 5: Update Data Annotations (n?u c?n)

M?t s? data types khác nhau gi?a SQL Server và PostgreSQL:

**SQL Server ? PostgreSQL:**
- `nvarchar(max)` ? `text`
- `datetime2` ? `timestamp`
- `uniqueidentifier` ? `uuid`
- `varbinary(max)` ? `bytea`

Ví d?:
```csharp
// Tr??c
[Column(TypeName = "nvarchar(500)")]
public string Url { get; set; }

// Sau (PostgreSQL t? handle)
[MaxLength(500)]
public string Url { get; set; }
```

### B??c 6: Test Locally v?i PostgreSQL

Docker Compose ?? test:
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: shortenurl
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Connection string local:
```
Host=localhost;Port=5432;Database=shortenurl;Username=admin;Password=password
```

---

## Option 2: S? d?ng Azure SQL Database (External)

N?u mu?n gi? SQL Server:

### B??c 1: T?o Azure SQL Database

1. Vào Azure Portal
2. T?o SQL Database
3. Configure firewall ?? allow Railway IPs
4. Copy connection string

### B??c 2: Add Connection String vào Railway

```
ConnectionStrings__url_shorten_serviceContext=Server=tcp:your-server.database.windows.net,1433;Initial Catalog=ShortenURL;Persist Security Info=False;User ID=admin;Password=YourPassword;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;
```

### B??c 3: Update appsettings.Production.json

```json
{
  "ConnectionStrings": {
    "url_shorten_serviceContext": "Server=tcp:your-server.database.windows.net,1433;Initial Catalog=ShortenURL;User ID=admin;Password=YourPassword;Encrypt=True;"
  }
}
```

**Nh??c ?i?m:**
- Chi phí cao h?n
- Ph?c t?p h?n trong setup
- C?n qu?n lý firewall rules

---

## Option 3: S? d?ng External SQL Server (On-premise/Cloud)

N?u b?n có SQL Server riêng:

### Requirements:
1. SQL Server ph?i có public IP ho?c VPN
2. Firewall allow connections t? Railway
3. SQL Server Authentication enabled

### Connection String:
```
Server=your-server-ip,1433;Database=ShortenURL;User Id=sa;Password=YourPassword;Encrypt=False;TrustServerCertificate=True;
```

**L?u ý b?o m?t:**
- Không expose SQL Server port ra internet
- Dùng VPN ho?c SSH tunnel
- Strong password và limited user permissions

---

## So sánh các Options

| Feature | PostgreSQL (Railway) | Azure SQL | External SQL Server |
|---------|---------------------|-----------|---------------------|
| Chi phí | ? R? nh?t | ?? Trung bình | ? Tùy thu?c |
| Setup | ? D? nh?t | ?? Trung bình | ? Ph?c t?p |
| Performance | ? T?t | ? T?t | ? Tùy thu?c |
| B?o m?t | ? Railway qu?n lý | ? Azure qu?n lý | ?? T? qu?n lý |
| Khuy?n ngh? | ????? | ??? | ?? |

---

## Common Issues & Solutions

### Issue 1: Migration fails v?i PostgreSQL

**L?i:** `Column type not supported`

**Solution:**
```csharp
// Specify column type explicitly
[Column(TypeName = "varchar(500)")]
public string Url { get; set; }
```

### Issue 2: Case sensitivity

PostgreSQL is case-sensitive for table/column names by default.

**Solution:** Use lowercase names ho?c quote identifiers:
```csharp
[Table("urls")]  // lowercase
public class Url
{
    [Column("id")]
    public int Id { get; set; }
}
```

### Issue 3: Identity columns

SQL Server uses `IDENTITY`, PostgreSQL uses `SERIAL`.

**Solution:** EF Core t? handle, nh?ng n?u có custom SQL:
```sql
-- SQL Server
CREATE TABLE Urls (
    Id INT IDENTITY(1,1) PRIMARY KEY
);

-- PostgreSQL
CREATE TABLE urls (
    id SERIAL PRIMARY KEY
);
```

---

## Testing Migration

### 1. Local Test
```bash
# Build
dotnet build

# Run migrations
dotnet ef database update

# Test
dotnet run
```

### 2. Verify Data
```sql
-- Check tables
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check data
SELECT * FROM urls LIMIT 10;
```

### 3. Railway Deploy
```bash
# Push changes
git add .
git commit -m "Migrate to PostgreSQL"
git push

# Railway auto-deploys
# Check logs in Railway dashboard
```

---

## Rollback Plan

N?u có v?n ??:

1. **Gi? SQL Server backup**
2. **Keep old migration files** (t?o branch m?i)
3. **Test thoroughly locally** tr??c khi deploy

```bash
# Rollback migration
dotnet ef database update PreviousMigration

# Rollback code
git revert HEAD
git push
```

---

## Khuy?n ngh?

? **Ch?n PostgreSQL trên Railway vì:**
- Free tier generous
- Integrated v?i Railway
- Easy setup
- Automatic backups
- Good performance
- PostgreSQL là DB ph? bi?n cho production

?? **Ch? gi? SQL Server n?u:**
- Có logic ph? thu?c SQL Server-specific features
- ?ã có Azure subscription
- Team quen thu?c v?i SQL Server ecosystem
