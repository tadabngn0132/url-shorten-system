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

        // Trường thống kê cơ bản
        public int? ClickCount { get; set; } = 0;
        public DateTime? LastAccessed { get; set; }
        public DateTime? ExpiryDate { get; set; }

        // Navigation property - danh sách thông tin chi tiết về các lượt click
        public virtual ICollection<ClickInfo> ClickDetails { get; set; } = new List<ClickInfo>();
    }
}