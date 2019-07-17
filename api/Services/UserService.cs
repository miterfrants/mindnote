using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Mindnote.Models;
using Mindnote.Helpers;
using Mindnote.Constants;

namespace Mindnote.Services
{
    public class UserService
    {
        private readonly String _jwtSecret;
        private readonly Int16 _jwtExpiration;
        private readonly MindnoteContext _context;
        public UserService(IOptions<AppSettings> appSettings, MindnoteContext context)
        {
            _jwtSecret = appSettings.Value.Secrets.JwtKey;
            _jwtExpiration = appSettings.Value.Common.Auth.JwtExpiration;
            _context = context;

        }

        public string GenerateToken(user user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_jwtSecret);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim(CustomClaimTypes.id, user.id.ToString()),
                    new Claim(CustomClaimTypes.email, user.email.ToString())
                }),
                Expires = DateTime.UtcNow.AddDays(_jwtExpiration),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        public JwtSecurityToken GetTokenSubject(String token)
        {
            var stream = token;
            var handler = new JwtSecurityTokenHandler();
            JwtSecurityToken JWT = (JwtSecurityToken)handler.ReadToken(token);
            return JWT;
        }

        public Int16 GetUserId(String token)
        {
            JwtSecurityToken tokenSubject = this.GetTokenSubject(token);
            return Int16.Parse(tokenSubject.Claims.SingleOrDefault(x => x.Type == CustomClaimTypes.id).Value);
        }

    }
}