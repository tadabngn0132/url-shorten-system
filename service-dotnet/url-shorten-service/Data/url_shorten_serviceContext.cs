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
    }
}
