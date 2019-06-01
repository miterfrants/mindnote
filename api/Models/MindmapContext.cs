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

        public virtual DbSet<board> board { get; set; }
        public virtual DbSet<node> node { get; set; }
        public virtual DbSet<user> user { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.HasAnnotation("ProductVersion", "2.2.4-servicing-10062");

            modelBuilder.Entity<board>(entity =>
            {
                entity.HasIndex(e => e.uniquename)
                    .HasName("uniquename")
                    .IsUnique();

                entity.Property(e => e.id).UseNpgsqlIdentityByDefaultColumn();

                entity.Property(e => e.created_at)
                    .HasColumnType("timestamp(6) with time zone")
                    .HasDefaultValueSql("now()");

                entity.Property(e => e.deleted_at).HasColumnType("timestamp(6) with time zone");

                entity.Property(e => e.is_public)
                    .IsRequired()
                    .HasDefaultValueSql("true");

                entity.Property(e => e.title).HasMaxLength(128);

                entity.Property(e => e.uniquename).HasMaxLength(256);
            });

            modelBuilder.Entity<node>(entity =>
            {
                entity.HasIndex(e => e.board_id)
                    .HasName("node_board_id");

                entity.HasIndex(e => e.owner_id)
                    .HasName("node_owner");

                entity.Property(e => e.id).UseNpgsqlIdentityByDefaultColumn();

                entity.Property(e => e.created_at)
                    .HasColumnType("timestamp(6) with time zone")
                    .HasDefaultValueSql("now()");

                entity.Property(e => e.deleted_at).HasColumnType("timestamp(6) with time zone");

                entity.Property(e => e.link).HasMaxLength(512);

                entity.Property(e => e.title)
                    .IsRequired()
                    .HasMaxLength(512);
            });

            modelBuilder.Entity<user>(entity =>
            {
                entity.HasIndex(e => e.email)
                    .HasName("email")
                    .IsUnique();

                entity.HasIndex(e => new { e.sub, e.provider })
                    .HasName("social_account")
                    .IsUnique();

                entity.Property(e => e.id).UseNpgsqlIdentityByDefaultColumn();

                entity.Property(e => e.birthday).HasColumnType("timestamp(6) with time zone");

                entity.Property(e => e.created_at).HasColumnType("timestamp(6) with time zone");

                entity.Property(e => e.deleted_at).HasColumnType("timestamp(6) with time zone");

                entity.Property(e => e.email)
                    .IsRequired()
                    .HasMaxLength(512);

                entity.Property(e => e.full_name).HasMaxLength(64);

                entity.Property(e => e.hashpwd).HasMaxLength(128);

                entity.Property(e => e.latest_login_ip).HasMaxLength(45);

                entity.Property(e => e.provider).HasMaxLength(16);

                entity.Property(e => e.salt).HasMaxLength(32);

                entity.Property(e => e.sub).HasMaxLength(128);

                entity.Property(e => e.username).HasMaxLength(128);

                entity.Property(e => e.vocation).HasMaxLength(64);
            });
        }
    }
}
