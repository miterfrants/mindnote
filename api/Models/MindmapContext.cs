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
        public virtual DbSet<image> image { get; set; }
        public virtual DbSet<node> node { get; set; }
        public virtual DbSet<node_relationship> node_relationship { get; set; }
        public virtual DbSet<transaction> transaction { get; set; }
        public virtual DbSet<user> user { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.HasAnnotation("ProductVersion", "2.2.4-servicing-10062");

            modelBuilder.Entity<board>(entity =>
            {
                entity.HasIndex(e => new { e.uniquename, e.deleted_at })
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

                entity.Property(e => e.title)
                    .IsRequired()
                    .HasMaxLength(128);

                entity.Property(e => e.uniquename).HasMaxLength(256);
            });

            modelBuilder.Entity<image>(entity =>
            {
                entity.Property(e => e.id).UseNpgsqlIdentityByDefaultColumn();

                entity.Property(e => e.created_at)
                    .HasColumnType("timestamp(6) with time zone")
                    .HasDefaultValueSql("now()");

                entity.Property(e => e.deleted_at).HasColumnType("timestamp(6) with time zone");

                entity.Property(e => e.filename)
                    .IsRequired()
                    .HasMaxLength(64);
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

                entity.Property(e => e.x).HasColumnType("numeric");

                entity.Property(e => e.y).HasColumnType("numeric");

                entity.HasOne(d => d.board_)
                    .WithMany(p => p.node)
                    .HasForeignKey(d => d.board_id)
                    .HasConstraintName("board_id");
            });

            modelBuilder.Entity<node_relationship>(entity =>
            {
                entity.HasIndex(e => new { e.parent_node_id, e.child_node_id })
                    .HasName("relationship_key")
                    .IsUnique();

                entity.Property(e => e.id).UseNpgsqlIdentityByDefaultColumn();
            });

            modelBuilder.Entity<transaction>(entity =>
            {
                entity.Property(e => e.id).UseNpgsqlIdentityByDefaultColumn();

                entity.Property(e => e.card_holder)
                    .IsRequired()
                    .HasMaxLength(128);

                entity.Property(e => e.created_at)
                    .HasColumnType("timestamp(6) with time zone")
                    .HasDefaultValueSql("now()");

                entity.Property(e => e.deleted_at).HasColumnType("timestamp(6) with time zone");

                entity.Property(e => e.email)
                    .IsRequired()
                    .HasMaxLength(32);

                entity.Property(e => e.is_next_subscribe)
                    .IsRequired()
                    .HasDefaultValueSql("true");

                entity.Property(e => e.method)
                    .IsRequired()
                    .HasMaxLength(64);

                entity.Property(e => e.paid_at).HasColumnType("timestamp(6) with time zone");

                entity.Property(e => e.phone)
                    .IsRequired()
                    .HasMaxLength(64);

                entity.Property(e => e.raw_data).HasColumnType("json");

                entity.Property(e => e.status)
                    .IsRequired()
                    .HasMaxLength(12);
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

                entity.Property(e => e.created_at)
                    .HasColumnType("timestamp(6) with time zone")
                    .HasDefaultValueSql("now()");

                entity.Property(e => e.deleted_at).HasColumnType("timestamp(6) with time zone");

                entity.Property(e => e.email)
                    .IsRequired()
                    .HasMaxLength(512);

                entity.Property(e => e.full_name).HasMaxLength(64);

                entity.Property(e => e.hashpwd).HasMaxLength(128);

                entity.Property(e => e.latest_login_ip).HasMaxLength(45);

                entity.Property(e => e.phone).HasMaxLength(32);

                entity.Property(e => e.provider).HasMaxLength(16);

                entity.Property(e => e.salt).HasMaxLength(32);

                entity.Property(e => e.sub).HasMaxLength(128);

                entity.Property(e => e.username).HasMaxLength(128);

                entity.Property(e => e.vocation).HasMaxLength(64);
            });
        }
    }
}
