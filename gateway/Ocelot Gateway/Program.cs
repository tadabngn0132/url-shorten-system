using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Ocelot.DependencyInjection;
using Ocelot.Middleware;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

<<<<<<< HEAD
// Add Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Láº¥y JWT Secret tá»« cáº¥u hÃ¬nh hoáº·c biáº¿n mÃ´i trÆ°á»ng
var jwtSecret = builder.Configuration["JwtSettings:Secret"] ?? 
    Environment.GetEnvironmentVariable("JWT_SECRET") ?? 
    throw new InvalidOperationException("JWT secret key not found in configuration or environment variables");

// Add JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer("Bearer", options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(jwtSecret)),
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

// Add Ocelot
builder.Configuration.AddJsonFile("ocelot.json", optional: false, reloadOnChange: true);
builder.Services.AddOcelot(builder.Configuration);

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Important! Authentication must be added before UseOcelot
app.UseAuthentication();

=======
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
>>>>>>> 724a93312ef6339d65799adb653cbdfb2a3b3aa7
app.UseOcelot().Wait();

app.Run();