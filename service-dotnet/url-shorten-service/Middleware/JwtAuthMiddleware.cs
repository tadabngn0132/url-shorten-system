using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
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
            Console.WriteLine($"Processing request: {context.Request.Method} {context.Request.Path}");
            
            string authHeader = context.Request.Headers["Authorization"];
            if (authHeader == null || !authHeader.StartsWith("Bearer "))
            {
                Console.WriteLine($"No valid Authorization header found for {context.Request.Path}");
                // Tiếp tục thực hiện pipeline mà không đặt thông tin người dùng
                await _next(context);
                return;
            }

            string token = authHeader.Substring("Bearer ".Length).Trim();
            Console.WriteLine($"Token found in request: {token.Substring(0, Math.Min(10, token.Length))}...");

            try
            {
                // Sử dụng cùng JWT secret với Node service
                var jwtSecret = _configuration["JwtSettings:Secret"] ??
                    Environment.GetEnvironmentVariable("JWT_SECRET") ??
                    "t4LQRcBnnA6hyucvkz6WJcwzaQA3GtF92bHatyNYh4D7XeJJpKCL";
                
                Console.WriteLine($"Using JWT secret key (first 5 chars): {jwtSecret.Substring(0, Math.Min(5, jwtSecret.Length))}...");

                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.ASCII.GetBytes(jwtSecret);

                try 
                {
                    var tokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(key),
                        ValidateIssuer = false,
                        ValidateAudience = false,
                        ValidateLifetime = true,
                        ClockSkew = TimeSpan.Zero
                    };

                    tokenHandler.ValidateToken(token, tokenValidationParameters, out var validatedToken);
                    Console.WriteLine("Token validated successfully");

                    var jwtToken = (JwtSecurityToken)validatedToken;

                    // Cố gắng lấy userId và xử lý an toàn
                    string userId = null;
                    try
                    {
                        userId = jwtToken.Claims.FirstOrDefault(x => x.Type == "id")?.Value;
                        Console.WriteLine($"Extracted userId: {userId}");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error extracting userId: {ex.Message}");
                    }

                    // Thêm thông tin người dùng vào HttpContext
                    context.Items["UserId"] = userId;

                    // Lấy username an toàn
                    try
                    {
                        var username = jwtToken.Claims.FirstOrDefault(x => x.Type == "username")?.Value ?? "unknown";
                        context.Items["Username"] = username;
                        Console.WriteLine($"Extracted username: {username}");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error extracting username: {ex.Message}");
                        context.Items["Username"] = "unknown";
                    }

                    // Lấy role an toàn
                    try
                    {
                        var userRole = jwtToken.Claims.FirstOrDefault(x => x.Type == "role")?.Value ?? "user";
                        context.Items["UserRole"] = userRole;
                        Console.WriteLine($"Extracted role: {userRole}");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error extracting role: {ex.Message}");
                        context.Items["UserRole"] = "user";
                    }

                    // Show all claims for debugging
                    Console.WriteLine("All token claims:");
                    foreach (var claim in jwtToken.Claims)
                    {
                        Console.WriteLine($"Claim: {claim.Type} = {claim.Value}");
                    }
                }
                catch (SecurityTokenExpiredException ex)
                {
                    Console.WriteLine($"Token expired: {ex.Message}");
                }
                catch (SecurityTokenValidationException ex)
                {
                    Console.WriteLine($"Token validation failed: {ex.Message}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Token processing error: {ex.GetType().Name} - {ex.Message}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"General JWT error: {ex.GetType().Name} - {ex.Message}");
            }

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