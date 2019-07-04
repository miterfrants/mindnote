using System;
using System.Collections.Generic;

namespace Mindmap.Models
{
    public partial class transaction
    {
        public int id { get; set; }
        public string method { get; set; }
        public string raw_data { get; set; }
        public string status { get; set; }
        public DateTime? created_at { get; set; }
        public DateTime? deleted_at { get; set; }
        public int owner_id { get; set; }
        public string card_holder { get; set; }
        public string phone { get; set; }
        public string email { get; set; }
        public int amount { get; set; }
        public int discount { get; set; }
        public DateTime? paid_at { get; set; }
    }
}
