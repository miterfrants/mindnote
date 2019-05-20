using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;

namespace Mindmap.Models
{
    public partial class MindmapContext : DbContext
    {
        public MindmapContext()
        {
        }

        public MindmapContext(DbContextOptions<MindmapContext> options)
            : base(options)
        {
        }

        public virtual DbSet<Node> Node { get; set; }
        public virtual DbSet<User> User { get; set; }
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.HasAnnotation("ProductVersion", "2.2.4-servicing-10062");

            modelBuilder.Entity<Node>(entity =>
            {
                entity.ToTable("node");

                entity.Property(e => e.Id)
                    .HasColumnName("id")
                    .UseNpgsqlIdentityByDefaultColumn();

                entity.Property(e => e.CreatedAt)
                    .HasColumnName("created_at")
                    .HasColumnType("timestamp(6) with time zone")
                    .HasDefaultValueSql("now()");

                entity.Property(e => e.DeletedAt)
                    .HasColumnName("deleted_at")
                    .HasColumnType("timestamp(6) with time zone");

                entity.Property(e => e.Description).HasColumnName("description");

                entity.Property(e => e.Link)
                    .HasColumnName("link")
                    .HasMaxLength(512);

                entity.Property(e => e.OwnerId).HasColumnName("owner_id");

                entity.Property(e => e.RelatedNodeId).HasColumnName("related_node_id");

                entity.Property(e => e.Title)
                    .IsRequired()
                    .HasColumnName("title")
                    .HasMaxLength(512);
            });

            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("user");

                entity.HasIndex(e => e.Email)
                    .HasName("email")
                    .IsUnique();

                entity.HasIndex(e => new { e.Sub, e.Provider })
                    .HasName("social_account")
                    .IsUnique();

                entity.Property(e => e.Id)
                    .HasColumnName("id")
                    .UseNpgsqlIdentityByDefaultColumn();

                entity.Property(e => e.Birthday)
                    .HasColumnName("birthday")
                    .HasColumnType("timestamp(6) with time zone");

                entity.Property(e => e.CreatedAt)
                    .HasColumnName("created_at")
                    .HasColumnType("timestamp(6) with time zone");

                entity.Property(e => e.DeletedAt)
                    .HasColumnName("deleted_at")
                    .HasColumnType("timestamp(6) with time zone");

                entity.Property(e => e.Email)
                    .IsRequired()
                    .HasColumnName("email")
                    .HasMaxLength(512);

                entity.Property(e => e.FullName)
                    .HasColumnName("full_name")
                    .HasMaxLength(64);

                entity.Property(e => e.Gender).HasColumnName("gender");

                entity.Property(e => e.Hashpwd)
                    .HasColumnName("hashpwd")
                    .HasMaxLength(128);

                entity.Property(e => e.LatestLoginIp)
                    .HasColumnName("latest_login_ip")
                    .HasMaxLength(45);

                entity.Property(e => e.Provider)
                    .HasColumnName("provider")
                    .HasMaxLength(16);

                entity.Property(e => e.Salt)
                    .HasColumnName("salt")
                    .HasMaxLength(32);

                entity.Property(e => e.Sub)
                    .HasColumnName("sub")
                    .HasMaxLength(128);

                entity.Property(e => e.Username)
                    .HasColumnName("username")
                    .HasMaxLength(128);

                entity.Property(e => e.Vocation)
                    .HasColumnName("vocation")
                    .HasMaxLength(64);
            });
        }
    }
}
