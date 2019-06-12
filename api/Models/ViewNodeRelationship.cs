using System;
using System.Collections.Generic;

namespace Mindmap.Models
{
    public partial class view_node_relationship
    {
        public int parent_node_id { get; set; }
        public int child_node_id { get; set; }
        public int id { get; set; }
        public int board_id { get; set; }
    }
}
