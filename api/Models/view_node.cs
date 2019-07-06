using System;
using System.Collections.Generic;

namespace Mindmap.Models
{
    public partial class view_node
    {
        public int id { get; set; }
        public string title { get; set; }
        public string description { get; set; }
        public string link { get; set; }
        public DateTime? created_at { get; set; }
        public DateTime? deleted_at { get; set; }
        public int? owner_id { get; set; }
        public int? board_id { get; set; }
        public string board_title { get; set; }
        public string board_uniquename { get; set; }
        public bool board_is_public { get; set; }
        public string username { get; set; }
        public int? x { get; set; }
        public int? y { get; set; }
    }
}
