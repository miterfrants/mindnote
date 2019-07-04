using System;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

using Mindmap.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authorization;

using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

using Mindmap.Services;

namespace Mindmap.Controllers
{
    [Authorize]
    [Route("mindmap/api/v1/auth/")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly MindmapContext _context;
        private readonly UserService _userService;

        public AuthController(MindmapContext context, UserService userService)
        {
            _context = context;
            _userService = userService;
        }

        [AllowAnonymous]
        [HttpPost]
        public async Task<dynamic> Post([FromBody] dynamic postBody)
        {
            string token = postBody["code"];
            // string authorization = Request.Headers["Authorization"];
            // if (authorization.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase)) {
            // validate token 
            HttpClient http = new HttpClient();
            string googleValidateUserUrl = "https://www.googleapis.com/oauth2/v3/userinfo?access_token=";
            HttpResponseMessage response = await http.GetAsync(googleValidateUserUrl + token);
            string result = await response.Content.ReadAsStringAsync();
            if ((int)response.StatusCode == StatusCodes.Status200OK)
            {
                // check user exists
                var userFromGoogle = JsonConvert.DeserializeObject<JObject>(result);
                string sub = (string)userFromGoogle["sub"];
                string email = (string)userFromGoogle["email"];
                string name = (string)userFromGoogle["name"];
                user currentUser;
                if (_context.user.Where(rec => rec.sub == sub).Count() == 0)
                {
                    currentUser = new user { email = email, provider = "GOOGLE", sub = sub, full_name = name };
                    _context.user.Add(currentUser);
                    _context.SaveChanges();
                }
                else
                {
                    currentUser = _context.user.SingleOrDefault(rec => rec.sub == sub);
                }

                userFromGoogle.Add("username", currentUser.username);
                // generate token
                userFromGoogle.Add("token", _userService.GenerateToken(currentUser));
                return userFromGoogle;
            }
            else
            {
                throw new Exception("Token Failed:" + result);
            }
        }
    }
}