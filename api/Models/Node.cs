using System;
using System.Collections.Generic;

namespace Mindmap.Models
{
    public partial class Node
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Link { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
        public int? RelatedNodeId { get; set; }
        public int? OwnerId { get; set; }
    }
}
