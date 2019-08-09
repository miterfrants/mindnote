using System;
using System.Collections.Generic;

namespace Mindnote.Models
{
    public partial class view_board
    {
        public int id { get; set; }
        public string title { get; set; }
        public DateTime created_at { get; set; }
        public DateTime? deleted_at { get; set; }
        public int? owner_id { get; set; }
        public bool is_public { get; set; }
        public string uniquename { get; set; }
        public int? image_id { get; set; }
        public string filename { get; set; }
        public decimal? width { get; set; }
        public decimal? height { get; set; }
        public string username { get; set; }
    }
}
