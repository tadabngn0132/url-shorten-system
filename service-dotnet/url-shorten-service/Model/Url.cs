namespace url_shorten_service.Model
{
    public class Url
    {
        public int Id { get; set; }
        public string OriginalUrl { get; set; }
        public string ShortCode { get; set; }
        public DateTime CreatedAt { get; set; }
        public string UserId { get; set; }
        public bool IsActive { get; set; }

        // Trường mới
        public int? ClickCount { get; set; } = 0;
        public DateTime? LastAccessed { get; set; }
        public DateTime? ExpiryDate { get; set; }
    }
}