namespace url_shorten_service.Model
{
    public class ClickInfo
    {
        public int Id { get; set; }
        public int UrlId { get; set; }
        public DateTime ClickedAt { get; set; }
        public string? IPAddress { get; set; }
        public string? Country { get; set; }
        public string? City { get; set; }
        public string? DeviceType { get; set; }
        public string? Browser { get; set; }
        public string? OperatingSystem { get; set; }
        public string? Language { get; set; }
        public string? Referrer { get; set; }

        // Reference to the parent URL
        public virtual Url Url { get; set; }
    }
}