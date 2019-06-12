using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;

namespace Mindmap.Models
{
    public partial class MindmapContextForView : DbContext
    {

        public MindmapContextForView()
        {
        }

        public MindmapContextForView(DbContextOptions<MindmapContextForView> options)
            : base(options)
        {
        }

        public virtual DbQuery<view_node_relationship> view_node_relationship { get; set; }
        public virtual DbQuery<view_node> view_node { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.HasAnnotation("ProductVersion", "2.2.4-servicing-10062");
            modelBuilder.Query<view_node_relationship>().ToView("view_node_relationship");
            modelBuilder.Query<view_node>().ToView("view_node");
        }
    }
}
