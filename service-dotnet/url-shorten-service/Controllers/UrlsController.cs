// Thay đổi method PostUrl
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

    // Kiểm tra người dúng có nhập custom shortcode chưa
    // Nếu người dùng cung cấp custom shortcode
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
    
    // Thiết lập ngày hết hạn mặc định (ví dụ 1 năm) nếu được yêu cầu
    // url.ExpiryDate = DateTime.UtcNow.AddYears(1);

    _context.Url.Add(url);
    await _context.SaveChangesAsync();

    return CreatedAtAction("GetUrl", new { id = url.Id }, url);
}

// Thay đổi method RedirectFromShortCode
[HttpGet]
[Route("/redirect/{shortCode}")]
public async Task<IActionResult> RedirectFromShortCode(string shortCode)
{
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

    // Kiểm tra thời hạn nếu có
    if (url.ExpiryDate.HasValue && url.ExpiryDate.Value < DateTime.UtcNow)
    {
        return BadRequest(new { error = "This shortened URL has expired" });
    }

    string originalUrl = url.OriginalUrl;

    // Đảm bảo URL có tiền tố http:// hoặc https://
    if (!originalUrl.StartsWith("http://") && !originalUrl.StartsWith("https://"))
    {
        originalUrl = "https://" + originalUrl;
    }

    // Kiểm tra và xác nhận URL hợp lệ
    if (!Uri.TryCreate(originalUrl, UriKind.Absolute, out Uri uriResult)
        || (uriResult.Scheme != Uri.UriSchemeHttp && uriResult.Scheme != Uri.UriSchemeHttps))
    {
        return BadRequest(new { error = "URL không hợp lệ" });
    }

    // Cập nhật số lượt truy cập
    url.ClickCount = (url.ClickCount ?? 0) + 1;
    url.LastAccessed = DateTime.UtcNow;
    await _context.SaveChangesAsync();

    // Chuyển hướng đến URL gốc
    return Redirect(originalUrl);
}

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