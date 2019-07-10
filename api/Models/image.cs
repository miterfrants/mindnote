using System;
using System.Collections.Generic;

namespace Mindmap.Models
{
    public partial class image
    {
        public int id { get; set; }
        public string filename { get; set; }
        public DateTime created_at { get; set; }
        public DateTime? deleted_at { get; set; }
        public int? owner_id { get; set; }
    }
}
