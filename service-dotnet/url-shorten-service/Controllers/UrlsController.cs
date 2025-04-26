using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using url_shorten_service.Data;
using url_shorten_service.Model;

namespace url_shorten_service.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UrlsController : ControllerBase
    {
        private readonly url_shorten_serviceContext _context;

        public UrlsController(url_shorten_serviceContext context)
        {
            _context = context;
        }

        // GET: api/Urls
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Url>>> GetUrl()
        {
            // Lấy thông tin người dùng từ token JWT
            string userId = HttpContext.Items["UserId"] as string;
            string userRole = HttpContext.Items["UserRole"] as string;

            // Nếu không có UserId và không phải admin, yêu cầu xác thực
            if (string.IsNullOrEmpty(userId) && userRole != "admin")
            {
                return Unauthorized(new { error = "Authentication required" });
            }

            // Lọc URL theo UserId nếu không phải admin
            if (userRole == "admin")
            {
                // Admin có thể xem tất cả URL
                return await _context.Url.ToListAsync();
            }
            else
            {
                // Người dùng chỉ có thể xem URL của họ
                return await _context.Url.Where(u => u.UserId == userId).ToListAsync();
            }
        }

        // GET: r/{shortCode} - Chuyển hướng trực tiếp từ shortcode đến URL đích
        [HttpGet]
        [Route("/redirect/{shortCode}")]
        public async Task<IActionResult> RedirectFromShortCode(string shortCode)
        {
            try {
                var url = await _context.Url.FirstOrDefaultAsync(u => u.ShortCode == shortCode);

                if (url == null)
                {
                    return NotFound(new { error = "URL not found" });
                }

                // Kiểm tra nếu URL không còn hoạt động
                if (!url.IsActive)
                {
                    return BadRequest(new { error = "This shortened URL is no longer active" });
                }

                string originalUrl = url.OriginalUrl;

                // Đảm bảo URL có tiền tố http:// hoặc https://
                if (!originalUrl.StartsWith("http://") && !originalUrl.StartsWith("https://"))
                {
                    originalUrl = "https://" + originalUrl;
                }

                // Cập nhật số lượt truy cập
                url.ClickCount = (url.ClickCount ?? 0) + 1;
                url.LastAccessed = DateTime.UtcNow;

                // Thu thập thông tin chi tiết về lượt click
                var clickInfo = new ClickInfo
                {
                    UrlId = url.Id,
                    ClickedAt = DateTime.UtcNow,
                    IPAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
                    Referrer = Request.Headers["Referer"].ToString(),
                    Browser = ParseUserAgent(Request.Headers["User-Agent"].ToString(), "browser"),
                    DeviceType = ParseUserAgent(Request.Headers["User-Agent"].ToString(), "device"),
                    OperatingSystem = ParseUserAgent(Request.Headers["User-Agent"].ToString(), "os"),
                    Language = Request.Headers["Accept-Language"].ToString().Split(',').FirstOrDefault()
                };

                // Thêm thông tin click mới
                _context.ClickInfo.Add(clickInfo);
                
                // Lưu thay đổi vào database
                await _context.SaveChangesAsync();

                // Chuyển hướng đến URL gốc
                return Redirect(originalUrl);
            }
            catch (Exception ex) {
                // Log lỗi
                Console.WriteLine($"Error redirecting: {ex.Message}");
                return StatusCode(500, new { error = "Internal server error during redirect" });
            }
        }
        
        // Helper method để phân tích User-Agent
        private string ParseUserAgent(string userAgent, string infoType)
        {
            userAgent = userAgent.ToLower();
            
            switch (infoType)
            {
                case "browser":
                    if (userAgent.Contains("chrome") && !userAgent.Contains("edg/")) return "Chrome";
                    if (userAgent.Contains("edg/")) return "Edge";
                    if (userAgent.Contains("firefox")) return "Firefox";
                    if (userAgent.Contains("safari") && !userAgent.Contains("chrome")) return "Safari";
                    if (userAgent.Contains("opr/") || userAgent.Contains("opera")) return "Opera";
                    if (userAgent.Contains("msie") || userAgent.Contains("trident")) return "Internet Explorer";
                    return "Unknown";
                
                case "device":
                    if (userAgent.Contains("iphone")) return "iPhone";
                    if (userAgent.Contains("ipad")) return "iPad";
                    if (userAgent.Contains("android") && userAgent.Contains("mobile")) return "Android Phone";
                    if (userAgent.Contains("android")) return "Android Tablet";
                    if (userAgent.Contains("windows") && (userAgent.Contains("touch") || userAgent.Contains("tablet"))) return "Windows Tablet";
                    if (userAgent.Contains("mobile") || userAgent.Contains("phone")) return "Mobile";
                    return "Desktop";
                
                case "os":
                    if (userAgent.Contains("windows")) return "Windows";
                    if (userAgent.Contains("macintosh") || userAgent.Contains("mac os")) return "macOS";
                    if (userAgent.Contains("linux") && !userAgent.Contains("android")) return "Linux";
                    if (userAgent.Contains("android")) return "Android";
                    if (userAgent.Contains("iphone") || userAgent.Contains("ipad") || userAgent.Contains("ipod")) return "iOS";
                    return "Unknown";
                    
                default:
                    return "Unknown";
            }
        }

        // GET: api/Urls/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Url>> GetUrl(int id)
        {
            // Lấy thông tin người dùng từ token JWT
            string userId = HttpContext.Items["UserId"] as string;
            string userRole = HttpContext.Items["UserRole"] as string;

            var url = await _context.Url.FindAsync(id);

            if (url == null)
            {
                return NotFound();
            }

            // Kiểm tra quyền truy cập - chỉ admin hoặc chủ sở hữu của URL mới có thể xem
            if (userRole != "admin" && url.UserId != userId)
            {
                return StatusCode(403, new { error = "You don't have permission to view this URL" });
            }

            return url;
        }

        // PUT: api/Urls/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutUrl(int id, Url url)
        {
            // Trong phương thức PutUrl (cập nhật URL)
            if (id != url.Id)
            {
                return BadRequest();
            }

            // Lấy URL hiện tại từ database
            var existingUrl = await _context.Url.FindAsync(id);
            if (existingUrl == null)
            {
                return NotFound();
            }

            // Kiểm tra quyền truy cập - chỉ admin hoặc chủ sở hữu của URL mới có thể cập nhật
            string userId = HttpContext.Items["UserId"] as string;
            string userRole = HttpContext.Items["UserRole"] as string;

            if (userRole != "admin" && existingUrl.UserId != userId)
            {
                return StatusCode(403, new { error = "You don't have permission to update this URL" });
            }

            // Nếu shortcode mới khác với shortcode cũ và không trống
            if (!string.IsNullOrEmpty(url.ShortCode) && url.ShortCode != existingUrl.ShortCode)
            {
                // Kiểm tra xem shortcode có hợp lệ không (chỉ chứa chữ cái, số, và các ký tự an toàn)
                var validCodePattern = new System.Text.RegularExpressions.Regex("^[a-zA-Z0-9_-]+$");
                if (!validCodePattern.IsMatch(url.ShortCode))
                {
                    return BadRequest(new { error = "Short code can only contain letters, numbers, underscore and hyphen." });
                }

                // Kiểm tra xem shortcode mới đã tồn tại chưa
                bool shortCodeExists = await _context.Url.AnyAsync(u => u.ShortCode == url.ShortCode && u.Id != id);
                if (shortCodeExists)
                {
                    // Trả về lỗi 400 Bad Request với thông báo
                    return BadRequest(new { error = "This short code is already in use. Please choose another one." });
                }
            }
            // Nếu shortcode mới là null hoặc trống, giữ nguyên shortcode cũ
            else if (string.IsNullOrEmpty(url.ShortCode))
            {
                url.ShortCode = existingUrl.ShortCode;
            }

            // Bảo toàn thông tin UserId và CreatedAt
            url.UserId = existingUrl.UserId;
            url.CreatedAt = existingUrl.CreatedAt;

            // Bảo toàn thông tin thống kê nếu không được cung cấp
            url.ClickCount = url.ClickCount ?? existingUrl.ClickCount;
            url.LastAccessed = url.LastAccessed ?? existingUrl.LastAccessed;

            _context.Entry(existingUrl).State = EntityState.Detached;
            _context.Entry(url).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UrlExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Urls
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Url>> PostUrl(Url url)
        {
            // Validate URL format
            if (!Uri.TryCreate(url.OriginalUrl, UriKind.Absolute, out Uri uriResult) ||
                (uriResult.Scheme != Uri.UriSchemeHttp && uriResult.Scheme != Uri.UriSchemeHttps))
            {
                return BadRequest(new { error = "Invalid URL format. Please provide a valid HTTP or HTTPS URL." });
            }

            // Lấy UserId từ token JWT nếu có
            if (HttpContext.Items.ContainsKey("UserId"))
            {
                url.UserId = HttpContext.Items["UserId"] as string;
            }

            // Kiểm tra người dùng có nhập custom shortcode chưa
            if (!string.IsNullOrEmpty(url.ShortCode))
            {
                // Kiểm tra xem shortcode có hợp lệ không (chỉ chứa chữ cái, số, và các ký tự an toàn)
                var validCodePattern = new System.Text.RegularExpressions.Regex("^[a-zA-Z0-9_-]+$");
                if (!validCodePattern.IsMatch(url.ShortCode))
                {
                    return BadRequest(new { error = "Short code can only contain letters, numbers, underscore and hyphen." });
                }

                // Kiểm tra xem shortcode đã tồn tại trong database chưa
                bool isExistingShortCode = await _context.Url.AnyAsync(u => u.ShortCode == url.ShortCode);
                if (isExistingShortCode)
                {
                    // Trả về lỗi 400 Bad Request với thông báo
                    return BadRequest(new { error = "This short code is already in use. Please choose another one." });
                }
            }
            else
            {
                // Tạo shortcode độc nhất nếu người dùng không cung cấp
                bool isUnique = false;
                string newShortCode = "";

                while (!isUnique)
                {
                    string guid = Guid.NewGuid().ToString("N");
                    newShortCode = guid.Substring(0, 8);

                    // Kiểm tra xem alias đã tồn tại chưa
                    isUnique = !await _context.Url.AnyAsync(u => u.ShortCode == newShortCode);
                }

                url.ShortCode = newShortCode;
            }

            // Thiết lập các giá trị mặc định
            url.CreatedAt = DateTime.UtcNow;
            url.ClickCount = 0;
            url.LastAccessed = null;

            _context.Url.Add(url);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetUrl", new { id = url.Id }, url);
        }

        // POST: api/Urls/bulk
        [HttpPost("bulk")]
        public async Task<ActionResult<List<Url>>> BulkCreateUrls([FromBody] BulkUrlRequest request)
        {
            if (request == null || request.Urls == null || request.Urls.Count == 0)
            {
                return BadRequest(new { error = "No URLs provided" });
            }

            // Lấy UserId từ token JWT nếu có
            string userId = HttpContext.Items["UserId"] as string;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "Authentication required for bulk operations" });
            }

            List<Url> createdUrls = new List<Url>();
            List<object> errors = new List<object>();

            foreach (var urlData in request.Urls)
            {
                try
                {
                    // Validate URL format
                    if (!Uri.TryCreate(urlData.OriginalUrl, UriKind.Absolute, out Uri uriResult) ||
                        (uriResult.Scheme != Uri.UriSchemeHttp && uriResult.Scheme != Uri.UriSchemeHttps))
                    {
                        errors.Add(new { 
                            originalUrl = urlData.OriginalUrl,
                            error = "Invalid URL format. Please provide a valid HTTP or HTTPS URL."
                        });
                        continue;
                    }

                    Url newUrl = new Url
                    {
                        OriginalUrl = urlData.OriginalUrl,
                        ShortCode = urlData.ShortCode,
                        UserId = userId,
                        CreatedAt = DateTime.UtcNow,
                        ClickCount = 0,
                        IsActive = true
                    };

                    // Xử lý custom short code nếu được cung cấp
                    if (!string.IsNullOrEmpty(newUrl.ShortCode))
                    {
                        // Kiểm tra xem shortcode có hợp lệ không (chỉ chứa chữ cái, số, và các ký tự an toàn)
                        var validCodePattern = new System.Text.RegularExpressions.Regex("^[a-zA-Z0-9_-]+$");
                        if (!validCodePattern.IsMatch(newUrl.ShortCode))
                        {
                            errors.Add(new { 
                                originalUrl = urlData.OriginalUrl,
                                error = "Short code can only contain letters, numbers, underscore and hyphen."
                            });
                            continue;
                        }

                        // Kiểm tra xem shortcode đã tồn tại trong database chưa
                        bool isExistingShortCode = await _context.Url.AnyAsync(u => u.ShortCode == newUrl.ShortCode);
                        if (isExistingShortCode)
                        {
                            errors.Add(new { 
                                originalUrl = urlData.OriginalUrl,
                                error = "This short code is already in use. Please choose another one."
                            });
                            continue;
                        }
                    }
                    else
                    {
                        // Tạo shortcode độc nhất nếu không được cung cấp
                        bool isUnique = false;
                        string newShortCode = "";

                        while (!isUnique)
                        {
                            string guid = Guid.NewGuid().ToString("N");
                            newShortCode = guid.Substring(0, 8);

                            // Kiểm tra xem shortcode đã tồn tại chưa
                            isUnique = !await _context.Url.AnyAsync(u => u.ShortCode == newShortCode);
                        }

                        newUrl.ShortCode = newShortCode;
                    }

                    _context.Url.Add(newUrl);
                    await _context.SaveChangesAsync();
                    createdUrls.Add(newUrl);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error creating URL {urlData.OriginalUrl}: {ex.Message}");
                    errors.Add(new { 
                        originalUrl = urlData.OriginalUrl,
                        error = "Failed to create shortened URL: " + ex.Message
                    });
                }
            }

            return Ok(new { 
                success = createdUrls.Count,
                failed = errors.Count,
                urls = createdUrls,
                errors = errors
            });
        }

        // DTO cho yêu cầu rút gọn nhiều URL
        public class BulkUrlRequest
        {
            public List<BulkUrlItem> Urls { get; set; }
        }

        public class BulkUrlItem
        {
            public string OriginalUrl { get; set; }
            public string ShortCode { get; set; }
        }

        // DELETE: api/Urls/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUrl(int id)
        {
            // Lấy thông tin người dùng từ token JWT
            string userId = HttpContext.Items["UserId"] as string;
            string userRole = HttpContext.Items["UserRole"] as string;

            var url = await _context.Url.FindAsync(id);
            if (url == null)
            {
                return NotFound();
            }

            // Kiểm tra quyền truy cập - chỉ admin hoặc chủ sở hữu của URL mới có thể xóa
            if (userRole != "admin" && url.UserId != userId)
            {
                return StatusCode(403, new { error = "You don't have permission to delete this URL" });
            }

            _context.Url.Remove(url);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/Urls/stats
        [HttpGet("stats")]
        public async Task<ActionResult<object>> GetUrlStats()
        {
            // Chỉ cho phép người dùng đã xác thực
            string userId = HttpContext.Items["UserId"] as string;
            string userRole = HttpContext.Items["UserRole"] as string;

            if (string.IsNullOrEmpty(userId) && userRole != "admin")
            {
                return Unauthorized(new { error = "Authentication required" });
            }

            try
            {
                // Nếu là admin, lấy tất cả URLs
                IQueryable<Url> query = _context.Url;

                // Nếu là người dùng thường, chỉ lấy URLs của họ
                if (userRole != "admin")
                {
                    query = query.Where(u => u.UserId == userId);
                }

                // Tính toán thống kê
                var stats = new
                {
                    totalUrls = await query.CountAsync(),
                    activeUrls = await query.Where(u => u.IsActive).CountAsync(),
                    totalClicks = await query.SumAsync(u => u.ClickCount ?? 0),
                    mostClickedUrl = await query.OrderByDescending(u => u.ClickCount)
                                           .Select(u => new { u.OriginalUrl, u.ShortCode, Clicks = u.ClickCount ?? 0 })
                                           .FirstOrDefaultAsync(),
                    recentUrls = await query.OrderByDescending(u => u.CreatedAt)
                                        .Take(5)
                                        .Select(u => new { u.OriginalUrl, u.ShortCode, u.CreatedAt, Clicks = u.ClickCount ?? 0 })
                                        .ToListAsync()
                };

                return Ok(stats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while retrieving URL statistics", details = ex.Message });
            }
        }

        // GET: api/Urls/dashboard-stats/{urlId?}
        [HttpGet("dashboard-stats/{urlId?}")]
        public async Task<ActionResult<object>> GetDashboardStats(int? urlId = null)
        {
            // Start debugging
            Console.WriteLine("===============================================");
            Console.WriteLine($"GetDashboardStats called with urlId: {urlId}");
            
            // Log authentication info
            string userId = HttpContext.Items["UserId"] as string;
            string username = HttpContext.Items["Username"] as string;
            string userRole = HttpContext.Items["UserRole"] as string;
            
            Console.WriteLine($"Auth Info: UserId={userId}, Username={username}, Role={userRole}");
            Console.WriteLine($"Authorization Header: {Request.Headers["Authorization"]}");
            
            // Dump all HttpContext.Items for debugging
            Console.WriteLine("All HttpContext.Items:");
            foreach (var item in HttpContext.Items)
            {
                Console.WriteLine($"  {item.Key}: {item.Value}");
            }

            // Chỉ cho phép người dùng đã xác thực
            if (string.IsNullOrEmpty(userId) && userRole != "admin")
            {
                Console.WriteLine("Authentication failed: UserId is null/empty and role is not admin");
                return Unauthorized(new { error = "Authentication required" });
            }

            try
            {
                Console.WriteLine("Building query for URLs...");
                // Base query - filter by userId if not admin
                IQueryable<Url> urlQuery = _context.Url;
                if (userRole != "admin")
                {
                    Console.WriteLine($"Filtering URLs for user: {userId}");
                    urlQuery = urlQuery.Where(u => u.UserId == userId);
                }
                else
                {
                    Console.WriteLine("Admin user - no filtering applied");
                }

                // If specific URL ID is provided, filter for that URL only
                if (urlId.HasValue)
                {
                    Console.WriteLine($"Filtering for specific URL ID: {urlId}");
                    var specificUrl = await urlQuery.FirstOrDefaultAsync(u => u.Id == urlId.Value);
                    if (specificUrl == null)
                    {
                        Console.WriteLine($"URL ID {urlId} not found or not accessible");
                        return NotFound(new { error = "URL not found or you don't have access to it" });
                    }
                    urlQuery = urlQuery.Where(u => u.Id == urlId.Value);
                }

                // Get all URLs that the user has access to
                var urlIds = await urlQuery.Select(u => u.Id).ToListAsync();
                Console.WriteLine($"Found {urlIds.Count} accessible URLs");
                
                if (!urlIds.Any())
                {
                    Console.WriteLine("No URLs found - returning empty data");
                    return Ok(new
                    {
                        message = "No URLs found",
                        totalClicks = 0,
                        clicksOverTime = new List<object>(),
                        deviceTypes = new List<object>(),
                        browsers = new List<object>(),
                        languages = new List<object>(),
                        operatingSystems = new List<object>(),
                        uniqueDevices = 0,
                        uniqueBrowsers = 0,
                        peakDay = new { date = "", count = 0 }
                    });
                }

                // Debugging - list URL IDs
                Console.WriteLine("URL IDs found:");
                foreach (var id in urlIds.Take(5))
                {
                    Console.WriteLine($"  URL ID: {id}");
                }
                if (urlIds.Count > 5)
                {
                    Console.WriteLine($"  ... and {urlIds.Count - 5} more");
                }

                // Get all click info for these URLs
                Console.WriteLine("Building ClickInfo query...");
                var clicksQuery = _context.ClickInfo.Where(c => urlIds.Contains(c.UrlId));

                // Total clicks
                int totalClicks = await clicksQuery.CountAsync();
                Console.WriteLine($"Total clicks found: {totalClicks}");

                // Clicks over time (last 30 days)
                var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
                Console.WriteLine($"Getting clicks from {thirtyDaysAgo} to now");
                
                var clicksOverTime = await clicksQuery
                    .Where(c => c.ClickedAt >= thirtyDaysAgo)
                    .GroupBy(c => c.ClickedAt.Date)
                    .Select(g => new 
                    { 
                        Date = g.Key,
                        Count = g.Count()
                    })
                    .OrderBy(x => x.Date)
                    .ToListAsync();
                
                Console.WriteLine($"Time series data points: {clicksOverTime.Count}");

                // Find peak day
                var peakDay = clicksOverTime.OrderByDescending(c => c.Count).FirstOrDefault() 
                    ?? new { Date = DateTime.UtcNow, Count = 0 };
                
                Console.WriteLine($"Peak day: {peakDay.Date:yyyy-MM-dd} with {peakDay.Count} clicks");

                // Unique devices count
                int uniqueDevices = await clicksQuery
                    .Select(c => c.DeviceType)
                    .Distinct()
                    .CountAsync();
                
                Console.WriteLine($"Unique devices: {uniqueDevices}");

                // Unique browsers count
                int uniqueBrowsers = await clicksQuery
                    .Select(c => c.Browser)
                    .Distinct()
                    .CountAsync();
                
                Console.WriteLine($"Unique browsers: {uniqueBrowsers}");

                // Device types
                var deviceTypes = await clicksQuery
                    .GroupBy(c => c.DeviceType)
                    .Select(g => new 
                    { 
                        DeviceType = g.Key,
                        Count = g.Count()
                    })
                    .OrderByDescending(x => x.Count)
                    .ToListAsync();
                
                Console.WriteLine($"Device types: {deviceTypes.Count}");

                // Browsers
                var browsers = await clicksQuery
                    .GroupBy(c => c.Browser)
                    .Select(g => new 
                    { 
                        Browser = g.Key,
                        Count = g.Count()
                    })
                    .OrderByDescending(x => x.Count)
                    .ToListAsync();
                
                Console.WriteLine($"Browsers: {browsers.Count}");

                // Languages
                var languages = await clicksQuery
                    .GroupBy(c => c.Language)
                    .Select(g => new 
                    { 
                        Language = g.Key,
                        Count = g.Count()
                    })
                    .OrderByDescending(x => x.Count)
                    .ToListAsync();
                
                Console.WriteLine($"Languages: {languages.Count}");

                // Operating Systems
                var operatingSystems = await clicksQuery
                    .GroupBy(c => c.OperatingSystem)
                    .Select(g => new 
                    { 
                        OS = g.Key,
                        Count = g.Count()
                    })
                    .OrderByDescending(x => x.Count)
                    .ToListAsync();
                
                Console.WriteLine($"Operating systems: {operatingSystems.Count}");
                Console.WriteLine("All data retrieved successfully, returning response");

                // Return all statistics
                return Ok(new
                {
                    totalClicks,
                    clicksOverTime,
                    deviceTypes,
                    browsers,
                    languages,
                    operatingSystems,
                    uniqueDevices,
                    uniqueBrowsers,
                    peakDay = new { 
                        date = peakDay.Date.ToString("MM/dd/yyyy"), 
                        count = peakDay.Count 
                    }
                });
            }
            catch (Exception ex)
            {
                // Log details of exception
                Console.WriteLine($"ERROR in GetDashboardStats: {ex.GetType().Name}");
                Console.WriteLine($"Message: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
                }
                Console.WriteLine("===============================================");
                
                return StatusCode(500, new { error = "An error occurred while retrieving dashboard statistics", details = ex.Message });
            }
        }

        // POST: api/Urls/transfer-ownership
        [HttpPost("transfer-ownership")]
        public async Task<IActionResult> TransferUrlOwnership([FromBody] TransferOwnershipRequest request)
        {
            if (request == null || request.UrlIds == null || request.UrlIds.Count == 0 || string.IsNullOrEmpty(request.NewUserId))
            {
                return BadRequest(new { error = "Invalid request data" });
            }

            try
            {
                int updatedCount = 0;
                List<int> successfulIds = new List<int>();
                List<int> failedIds = new List<int>();

                foreach (var urlId in request.UrlIds)
                {
                    var url = await _context.Url.FindAsync(urlId);
                    
                    if (url == null)
                    {
                        failedIds.Add(urlId);
                        continue;
                    }

                    // Chỉ cập nhật URL nếu userId là "guest" hoặc không có
                    if (string.IsNullOrEmpty(url.UserId) || url.UserId == "guest")
                    {
                        url.UserId = request.NewUserId;
                        _context.Entry(url).State = EntityState.Modified;
                        updatedCount++;
                        successfulIds.Add(urlId);
                    }
                    else
                    {
                        failedIds.Add(urlId);
                    }
                }

                // Lưu các thay đổi vào database
                if (updatedCount > 0)
                {
                    await _context.SaveChangesAsync();
                }

                return Ok(new { 
                    message = $"Transferred ownership of {updatedCount} URLs to user {request.NewUserId}",
                    successfulIds,
                    failedIds
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while transferring URL ownership", details = ex.Message });
            }
        }

        private bool UrlExists(int id)
        {
            return _context.Url.Any(e => e.Id == id);
        }
    }

    // DTO cho yêu cầu chuyển đổi quyền sở hữu
    public class TransferOwnershipRequest
    {
        public List<int> UrlIds { get; set; }
        public string NewUserId { get; set; }
    }
}