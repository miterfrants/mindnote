using System.Net.WebSockets;
using System.Net.Http.Headers;
using System.Net.Cache;
using System.Net;
using System;
using System.Collections.Generic;
using System.Linq;
using Mindmap.Models;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using Newtonsoft.Json;

namespace Mindmap.Controllers {
    [Route ("mindmap/api/v1/users")]
    [ApiController]
    public class UserController : ControllerBase {
        private readonly MindmapContext _context;
        public UserController (MindmapContext context) {
            _context = context;
        }

        [HttpGet]
        public ActionResult<List<User>> GetAll () {
            if (_context.Node.Count () == 0) {
                return new List<User> ();
            }
            return _context.User.ToList ();
        }

        [HttpPost]
        public object Post ([FromBody] Object json) {
            string authorization = Request.Headers["Authorization"];
            if (authorization.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase)) {
                string token = authorization.Substring("Bearer ".Length).Trim();
                HttpClient http = new HttpClient();
                string googleValidateUserUrl = "https://www.googleapis.com/oauth2/v3/userinfo?access_token=";
                System.Threading.Tasks.Task<string> asyncTask = http.GetStringAsync(googleValidateUserUrl+token);
                string result = asyncTask.Result;
                return JsonConvert.DeserializeObject<Object>(result);
            } else {
                throw new Exception("Token Failed");
            }
        }
    }
}