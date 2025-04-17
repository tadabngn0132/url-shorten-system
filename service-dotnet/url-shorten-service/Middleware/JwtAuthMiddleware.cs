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
            // Đối với các requests đến API của người dùng khách, chúng ta cho phép truy cập
            // Nhưng đối với các chức năng quản lý URL (PUT, DELETE), chúng ta có thể kiểm tra xác thực
            string path = context.Request.Path.Value.ToLower();
            string method = context.Request.Method;

            // Cho phép requests GET và POST cơ bản mà không cần xác thực
            // Nhưng yêu cầu xác thực cho chỉnh sửa/xóa URL
            bool requireAuth = 
                (method == "PUT" || method == "DELETE") || 
                (path.Contains("/admin") || path.Contains("/dashboard"));

            if (!requireAuth)
            {
                await _next(context);
                return;
            }

            string authHeader = context.Request.Headers["Authorization"];
            if (authHeader == null || !authHeader.StartsWith("Bearer "))
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                await context.Response.WriteAsync("Authentication required");
                return;
            }

            string token = authHeader.Substring("Bearer ".Length).Trim();

            try
            {
                // Xác minh token JWT
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.ASCII.GetBytes(_configuration["JwtSettings:Secret"] ?? "your_jwt_secret_key_for_validation");
                
                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ClockSkew = TimeSpan.Zero
                }, out var validatedToken);

                var jwtToken = (JwtSecurityToken)validatedToken;
                string userId = jwtToken.Claims.First(x => x.Type == "id").Value;

                // Thêm thông tin người dùng vào HttpContext để các controllers có thể sử dụng
                context.Items["UserId"] = userId;
                context.Items["Username"] = jwtToken.Claims.First(x => x.Type == "username").Value;
                context.Items["UserRole"] = jwtToken.Claims.First(x => x.Type == "role").Value;
            }
            catch
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                await context.Response.WriteAsync("Invalid token");
                return;
            }

            // Tiếp tục pipeline request
            await _next(context);
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