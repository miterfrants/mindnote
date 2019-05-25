using System;

namespace Mindmap.Helpers
{
    public class AppSettings
    {
        public Secrets Secrets { get; set; }
        public Common Common { get; set; }
    }

    public class Common
    {
        public Auth Auth { get; set; }
    }

    public class Auth
    {
        public Int16 JwtExpiration { get; set; }
    }

    public class Secrets
    {
        public string DBConnectionString { get; set; }
        public string JwtKey { get; set; }
    }
}