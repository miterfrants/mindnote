using System.Net.WebSockets;
using System.Net.Http.Headers;
using System.Net.Cache;
using System.Net;
using System;
using Microsoft.AspNetCore.Authorization;
using System.Collections.Generic;
using System.Linq;
using Mindmap.Models;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using Newtonsoft.Json;
using Mindmap.Services;

namespace Mindmap.Controllers
{
    [Authorize]
    [Route("mindmap/api/v1/users/")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly MindmapContext _context;
        private readonly UserService _userService;
        public UserController(MindmapContext context, UserService userService)
        {
            _context = context;
            _userService = userService;
        }

        [HttpGet]
        [Route("{username}/")]
        public ActionResult<user> Get([FromRoute] String username)
        {
            string authorization = Request.Headers["Authorization"];
            string token = authorization.Substring("Bearer ".Length).Trim();

            Int16 userId = _userService.GetUserId(token);
            user user = _context.user.FirstOrDefault(x => x.id == userId);
            if (user == null)
            {
                HttpContext.Response.StatusCode = HttpStatusCode.NotFound.GetHashCode();
                return null;
            }
            else
            {
                return user;
            }
        }

        [HttpGet]
        [Route("{username}/boards/")]
        public ActionResult<List<board>> GetBoards([FromRoute] String username)
        {
            string authorization = Request.Headers["Authorization"];
            string token = authorization.Substring("Bearer ".Length).Trim();
            Int16 userId = _userService.GetUserId(token);

            List<board> boards = _context.board.Where(x => x.owner_id == userId).ToList();
            if (boards == null)
            {
                HttpContext.Response.StatusCode = HttpStatusCode.NotFound.GetHashCode();
                return null;
            }
            else
            {
                return boards;
            }
        }

        [HttpGet]
        [Route("{username}/boards/{boardUniquename}/nodes/")]
        public ActionResult<List<node>> GetNodesInBoard([FromRoute] String username, [FromRoute] String boardUniquename)
        {
            string authorization = Request.Headers["Authorization"];
            string token = authorization.Substring("Bearer ".Length).Trim();
            Int16 userId = _userService.GetUserId(token);
            board board = _context.board.FirstOrDefault(x => x.uniquename.Equals(boardUniquename) && x.owner_id == userId);

            if (board == null)
            {
                HttpContext.Response.StatusCode = HttpStatusCode.NotFound.GetHashCode();
                return null;
            }

            List<node> nodes = _context.node.Where(x => x.board_id == board.id).ToList();
            return nodes;
        }
    }
}