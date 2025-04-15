using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using url_shorten_service.Data;
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<url_shorten_serviceContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("url_shorten_serviceContext") ?? throw new InvalidOperationException("Connection string 'url_shorten_serviceContext' not found.")));

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

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddDbContext<url_shorten_serviceContext>(options =>
options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowAllOrigins");

app.UseAuthorization();

app.MapControllers();

app.Run();
