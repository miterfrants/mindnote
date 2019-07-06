using System;
using System.Collections.Generic;

namespace Mindmap.Models
{
    public partial class node_relationship
    {
        public int id { get; set; }
        public int parent_node_id { get; set; }
        public int child_node_id { get; set; }
    }
}
