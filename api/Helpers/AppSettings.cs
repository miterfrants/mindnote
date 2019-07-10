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
        public string TapPayEndpoint { get; set; }
        public string GCPProjectId { get; set; }
        public string GCSBucketName { get; set; }
    }

    public class Auth
    {
        public Int16 JwtExpiration { get; set; }
    }

    public class Secrets
    {
        public string DBConnectionString { get; set; }
        public string JwtKey { get; set; }
        public string TapPayPartnerKey { get; set; }
        public string GCSCredential { get; set; }
    }
}