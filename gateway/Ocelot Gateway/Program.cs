using Ocelot.Cache.CacheManager;
using Ocelot.DependencyInjection;
using Ocelot.Middleware;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Configuration.AddJsonFile(
  "ocelot.json",
  optional: false,
  reloadOnChange: true
  );

// Thêm vào ph?n ??u c?a ph??ng th?c ConfigureServices
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder =>
        {
            builder.AllowAnyOrigin()
                   .AllowAnyMethod()
                   .AllowAnyHeader();
        });
});

builder.Services.AddOcelot(builder.Configuration).AddCacheManager(x =>
{
    x.WithDictionaryHandle();
});

var app = builder.Build();

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
// Và thêm vào ph?n middleware pipeline (tr??c app.UseOcelot())
app.UseCors("AllowAll");
app.UseOcelot().Wait();


app.Run();