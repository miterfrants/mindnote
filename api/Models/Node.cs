using System;
using System.Collections.Generic;

namespace Mindmap.Models
{
    public partial class node
    {
        public int id { get; set; }
        public string title { get; set; }
        public string description { get; set; }
        public string link { get; set; }
        public DateTime? created_at { get; set; }
        public DateTime? deleted_at { get; set; }
        public int? owner_id { get; set; }
        public int? board_id { get; set; }
        public decimal? x { get; set; }
        public decimal? y { get; set; }

        public virtual board board_ { get; set; }
    }
}
