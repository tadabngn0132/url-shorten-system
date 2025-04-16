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
            return await _context.Url.ToListAsync();
        }

        // GET: r/{shortCode} - Chuyển hướng trực tiếp từ shortcode đến URL đích
        [HttpGet]
        [Route("/redirect/{shortCode}")]
        public async Task<IActionResult> RedirectFromShortCode(string shortCode)
        {
            var url = await _context.Url.FirstOrDefaultAsync(u => u.ShortCode == shortCode);

            if (url == null)
            {
                return NotFound();
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
                return BadRequest("URL không hợp lệ");
            }

            // Cập nhật số lượt truy cập nếu bạn có thêm trường này trong model
            // url.ClickCount++;
            // await _context.SaveChangesAsync();

            // Chuyển hướng đến URL gốc
            return Redirect(originalUrl);
        }

        // GET: api/Urls/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Url>> GetUrl(int id)
        {
            var url = await _context.Url.FindAsync(id);

            if (url == null)
            {
                return NotFound();
            }

            return url;
        }

        // PUT: api/Urls/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutUrl(int id, Url url)
        {
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

            // Nếu shortcode mới là null hoặc trống, giữ nguyên shortcode cũ
            if (string.IsNullOrEmpty(url.ShortCode))
            {
                url.ShortCode = existingUrl.ShortCode;
            }

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
            // Kiểm tra xem người dùng đã cung cấp alias chưa
            if (string.IsNullOrEmpty(url.ShortCode))
            {
                // Tạo shortcode độc nhất
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

            _context.Url.Add(url);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetUrl", new { id = url.Id }, url);
        }

        // DELETE: api/Urls/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUrl(int id)
        {
            var url = await _context.Url.FindAsync(id);
            if (url == null)
            {
                return NotFound();
            }

            _context.Url.Remove(url);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool UrlExists(int id)
        {
            return _context.Url.Any(e => e.Id == id);
        }
    }
}
