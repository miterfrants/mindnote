using System;
using System.Collections.Generic;

namespace Mindnote.Models
{
    public partial class node_relationship
    {
        public int id { get; set; }
        public int parent_node_id { get; set; }
        public int child_node_id { get; set; }
        public DateTime created_at { get; set; }
        public DateTime? deleted_at { get; set; }
    }
}
