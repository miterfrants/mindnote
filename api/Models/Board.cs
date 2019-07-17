using System;
using System.Collections.Generic;

namespace Mindnote.Models
{
    public partial class board
    {
        public board()
        {
            node = new HashSet<node>();
        }

        public int id { get; set; }
        public string title { get; set; }
        public DateTime created_at { get; set; }
        public DateTime? deleted_at { get; set; }
        public int? owner_id { get; set; }
        public bool is_public { get; set; }
        public string uniquename { get; set; }

        public virtual ICollection<node> node { get; set; }
    }
}
