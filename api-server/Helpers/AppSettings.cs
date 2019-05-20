using System;

namespace Mindmap.Helpers
{
    public class AppSettings
    {
        public Auth Auth { get; set; }
        public ConnectionStrings ConnectionStrings  { get; set; }
    }

    public class Auth {
        public string JwtSecret { get; set; }
        public Int16 JwtExpiration { get; set; }
    }

    public class ConnectionStrings {
        public string DB { get; set; }
    }
}