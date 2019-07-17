using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;

namespace Mindnote.Models
{
    public partial class MindnoteContextForView : DbContext
    {

        public MindnoteContextForView()
        {
        }

        public MindnoteContextForView(DbContextOptions<MindnoteContextForView> options)
            : base(options)
        {
        }

        public virtual DbQuery<view_node_relationship> view_node_relationship { get; set; }
        public virtual DbQuery<view_node> view_node { get; set; }
        public virtual DbQuery<view_user> view_user { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.HasAnnotation("ProductVersion", "2.2.4-servicing-10062");
            modelBuilder.Query<view_node_relationship>().ToView("view_node_relationship");
            modelBuilder.Query<view_node>().ToView("view_node");
            modelBuilder.Query<view_user>().ToView("view_user");
        }
    }
}
