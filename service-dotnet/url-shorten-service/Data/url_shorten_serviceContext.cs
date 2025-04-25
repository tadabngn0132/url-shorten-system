using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using url_shorten_service.Model;

namespace url_shorten_service.Data
{
    public class url_shorten_serviceContext : DbContext
    {
        public url_shorten_serviceContext (DbContextOptions<url_shorten_serviceContext> options)
            : base(options)
        {
        }

        public DbSet<url_shorten_service.Model.Url> Url { get; set; } = default!;
        public DbSet<url_shorten_service.Model.ClickInfo> ClickInfo { get; set; } = default!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Thiết lập mối quan hệ giữa Url và ClickInfo
            modelBuilder.Entity<ClickInfo>()
                .HasOne(c => c.Url)
                .WithMany(u => u.ClickDetails)
                .HasForeignKey(c => c.UrlId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
