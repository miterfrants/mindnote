using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Mindmap.Models;
using Mindmap.Helpers;
using Mindmap.Constants;

namespace Mindmap.Services
{
    public class UserService
    {
        private readonly String _jwtSecret;
        private readonly Int16 _jwtExpiration;
        private readonly MindmapContext _context;
        public UserService(IOptions<AppSettings> appSettings, MindmapContext context)
        {
            _jwtSecret = appSettings.Value.Auth.JwtSecret;
            _jwtExpiration = appSettings.Value.Auth.JwtExpiration;
            _context = context;
            
        }

        public string GenerateToken(User user){
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_jwtSecret);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[] 
                {
                    new Claim(CustomClaimTypes.Id, user.Id.ToString()),
                    new Claim(CustomClaimTypes.Email, user.Email.ToString())
                }),
                Expires = DateTime.UtcNow.AddDays(_jwtExpiration),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        public JwtSecurityToken GetTokenSubject(String token) {
            var stream = token;  
            var handler = new JwtSecurityTokenHandler();
            JwtSecurityToken JWT = (JwtSecurityToken) handler.ReadToken(token);
            return JWT;
        }

        public Int16 GetUserId(String token) {
            JwtSecurityToken tokenSubject =  this.GetTokenSubject(token);
            return Int16.Parse(tokenSubject.Claims.SingleOrDefault(x => x.Type == CustomClaimTypes.Id).Value);
        }

    }
}