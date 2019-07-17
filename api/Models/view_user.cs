using System;
using System.Collections.Generic;

namespace Mindnote.Models
{
    public partial class view_user
    {
        public int id { get; set; }
        public string email { get; set; }
        public string username { get; set; }
        public string hashpwd { get; set; }
        public DateTime? birthday { get; set; }
        public string vocation { get; set; }
        public char? gender { get; set; }
        public DateTime created_at { get; set; }
        public DateTime? deleted_at { get; set; }
        public string salt { get; set; }
        public string latest_login_ip { get; set; }
        public string provider { get; set; }
        public string sub { get; set; }
        public string full_name { get; set; }
        public string phone { get; set; }
        public bool is_subscribed { get; set; }
        public int? transaction_id { get; set; }
        public int board_count { get; set; }
        public bool is_next_subscribe { get; set; }
    }
}
