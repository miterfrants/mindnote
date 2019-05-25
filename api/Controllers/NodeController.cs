using System.Collections.Generic;
using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Mindmap.Models;
using Mindmap.Services;
using Mindmap.Constants;

namespace Mindmap.Controllers {
    [Authorize]
    [Route ("mindmap/api/v1/nodes")]
    [ApiController]
    public class NodeController : ControllerBase {
        private readonly MindmapContext _context;
        private readonly UserService _userService;
        public NodeController (MindmapContext context, UserService userService) {
            _context = context;
            _userService = userService;
        }

        [AllowAnonymous]
        [HttpGet]
        public ActionResult<List<Node>> GetAll () {
            if (_context.Node.Count () == 0) {
                return new List<Node> ();
            }
            string authorization = Request.Headers["Authorization"];
            string token = authorization.Substring("Bearer ".Length).Trim();
            Int16 userId = _userService.GetUserId(token);
            return _context.Node.Where(x => x.OwnerId == userId).ToList ();
        }

        [HttpPost]
        public ActionResult<Node> Post ([FromBody] Node node) {
            string authorization = Request.Headers["Authorization"];
            string token = authorization.Substring("Bearer ".Length).Trim();

            Int16 userId = _userService.GetUserId(token);

            Node newNode = new Node { Title = node.Title, Description = node.Description, RelatedNodeId = node.RelatedNodeId, OwnerId = userId };
            _context.Node.Add (newNode);
            _context.SaveChanges ();
            return _context.Node.SingleOrDefault(rec => rec.Id == newNode.Id);
        }
    }
}