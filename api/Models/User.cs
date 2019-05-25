using System;
using System.Collections.Generic;

namespace Mindmap.Models
{
    public partial class User
    {
        public int Id { get; set; }
        public string Email { get; set; }
        public string Username { get; set; }
        public string Hashpwd { get; set; }
        public DateTime? Birthday { get; set; }
        public string Vocation { get; set; }
        public char? Gender { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
        public string Salt { get; set; }
        public string LatestLoginIp { get; set; }
        public string Provider { get; set; }
        public string Sub { get; set; }
        public string FullName { get; set; }
    }
}
