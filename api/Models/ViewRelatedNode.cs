using System;
using System.Collections.Generic;

namespace Mindmap.Models
{
    public partial class ViewRelatedNode
    {
        public int parent_node_id { get; set; }
        public int child_node_id { get; set; }
        public string parent_title { get; set; }
        public string parent_description { get; set; }
        public string child_title { get; set; }
        public string child_description { get; set; }
        public int? owner_id { get; set; }
        public int? board_id { get; set; }
    }
}
