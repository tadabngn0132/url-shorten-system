using System;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

namespace url_shorten_service.Middleware
{
    public class JwtAuthMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IConfiguration _configuration;

        public JwtAuthMiddleware(RequestDelegate next, IConfiguration configuration)
        {
            _next = next;
            _configuration = configuration;
        }

        public async Task Invoke(HttpContext context)
        {
            //string path = context.Request.Path.Value.ToLower();
            //string method = context.Request.Method;

            //bool requireAuth =
            //    (method == "PUT" || method == "DELETE") ||
            //    (path.Contains("/admin") || path.Contains("/dashboard"));

            //if (!requireAuth)
            //{
            //    await _next(context);
            //    return;
            //}

            //string authHeader = context.Request.Headers["Authorization"];
            //if (authHeader == null || !authHeader.StartsWith("Bearer "))
            //{
            //    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            //    await context.Response.WriteAsync("Authentication required");
            //    return;
            //}

            //string token = authHeader.Substring("Bearer ".Length).Trim();

            //try
            //{
            //    // Sử dụng cùng JWT secret với Node service
            //    var tokenHandler = new JwtSecurityTokenHandler();
            //    var key = Encoding.ASCII.GetBytes(
            //        _configuration["JwtSettings:Secret"] ??
            //        Environment.GetEnvironmentVariable("JWT_SECRET") ??
            //        "t4LQRcBnnA6hyucvkz6WJcwzaQA3GtF92bHatyNYh4D7XeJJpKCL");

            //    tokenHandler.ValidateToken(token, new TokenValidationParameters
            //    {
            //        ValidateIssuerSigningKey = true,
            //        IssuerSigningKey = new SymmetricSecurityKey(key),
            //        ValidateIssuer = false,
            //        ValidateAudience = false,
            //        ClockSkew = TimeSpan.Zero
            //    }, out var validatedToken);

            //    var jwtToken = (JwtSecurityToken)validatedToken;

            //    // Cố gắng lấy userId và xử lý an toàn
            //    string userId = null;
            //    try
            //    {
            //        userId = jwtToken.Claims.FirstOrDefault(x => x.Type == "id")?.Value;
            //    }
            //    catch { /* Bỏ qua lỗi */ }

            //    // Thêm thông tin người dùng vào HttpContext
            //    context.Items["UserId"] = userId;

            //    // Lấy username an toàn
            //    try
            //    {
            //        context.Items["Username"] = jwtToken.Claims.FirstOrDefault(x => x.Type == "username")?.Value ?? "unknown";
            //    }
            //    catch
            //    {
            //        context.Items["Username"] = "unknown";
            //    }

            //    // Lấy role an toàn
            //    try
            //    {
            //        context.Items["UserRole"] = jwtToken.Claims.FirstOrDefault(x => x.Type == "role")?.Value ?? "user";
            //    }
            //    catch
            //    {
            //        context.Items["UserRole"] = "user";
            //    }
            //}
            //catch (Exception ex)
            //{
            //    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            //    await context.Response.WriteAsync($"Invalid token: {ex.Message}");
            //    return;
            //}

            await _next(context);
            return;
        }
    }

    // Extension method để đăng ký middleware
    public static class JwtAuthMiddlewareExtensions
    {
        public static IApplicationBuilder UseJwtAuth(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<JwtAuthMiddleware>();
        }
    }
}