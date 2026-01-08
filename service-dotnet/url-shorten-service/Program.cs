using Microsoft.EntityFrameworkCore;
using url_shorten_service.Data;
using url_shorten_service.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Cấu hình DbContext
builder.Services.AddDbContext<url_shorten_serviceContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("url_shorten_serviceContext") ?? throw new InvalidOperationException("Connection string 'url_shorten_serviceContext' not found.")));

// Cấu hình CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins",
        builder =>
        {
            builder.AllowAnyOrigin()
                    .AllowAnyMethod()
                    .AllowAnyHeader();
        });
});

// Thêm services vào container
builder.Services.AddControllers();

// Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Tự động apply migrations khi app khởi động (cho Railway deployment)
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var dbContext = services.GetRequiredService<url_shorten_serviceContext>();
        dbContext.Database.Migrate();
        Console.WriteLine("✅ Database migrations applied successfully!");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ Error during migration: {ex.Message}");
        throw;
    }
}

// Cấu hình pipeline HTTP request
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Sử dụng CORS
app.UseCors("AllowAllOrigins");

// Thêm middleware xác thực JWT - CHÚ Ý: Đừng đăng ký như một service
app.UseJwtAuth();

app.UseAuthorization();

app.MapControllers();

app.Run();