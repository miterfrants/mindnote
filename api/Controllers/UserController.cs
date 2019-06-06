using System.Data.Common;
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

            List<board> boards = _context.board.Where(x => x.owner_id == userId && x.deleted_at == null).OrderByDescending(x => x.created_at).Take(5).ToList();
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

        [HttpPost]
        [Route("{username}/boards/")]
        public ActionResult<board> PostBoard([FromRoute] String username, [FromBody] dynamic body)
        {
            string authorization = Request.Headers["Authorization"];
            string token = authorization.Substring("Bearer ".Length).Trim();
            Int16 userId = _userService.GetUserId(token);

            board newBoard = new board { title = body.title, uniquename = body.uniquename, owner_id = userId };
            _context.board.Add(newBoard);
            _context.SaveChanges();

            return _context.board.SingleOrDefault(rec => rec.id == newBoard.id);
        }


        [HttpDelete]
        [Route("{username}/boards/{boardUniquename}")]
        public void DeleteBoard([FromRoute] String username, [FromRoute] String boardUniquename)
        {
            string authorization = Request.Headers["Authorization"];
            string token = authorization.Substring("Bearer ".Length).Trim();
            Int16 userId = _userService.GetUserId(token);

            board board = _context.board.FirstOrDefault(x => x.uniquename.Equals(boardUniquename) && x.owner_id == userId);
            board.deleted_at = DateTime.Now;

            _context.SaveChanges();
        }

        [HttpPatch]
        [Route("{username}/boards/{boardUniquename}")]
        public ActionResult<board> PatchBoard([FromRoute] String username, [FromRoute] String boardUniquename, [FromBody] dynamic requestBody)
        {
            string authorization = Request.Headers["Authorization"];
            string token = authorization.Substring("Bearer ".Length).Trim();
            Int16 userId = _userService.GetUserId(token);

            board board = _context.board.FirstOrDefault(x => x.uniquename.Equals(boardUniquename) && x.owner_id == userId);
            board.is_public = requestBody.is_public;
            if (requestBody.title != null)
            {
                board.title = requestBody.title;
            }
            if (requestBody.uniquename != null)
            {
                board.uniquename = requestBody.uniquename;
            }
            _context.SaveChanges();
            return board;
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

        [HttpPost]
        [Route("{username}/boards/{boardUniquename}/nodes/")]
        public ActionResult<node> PostNode([FromRoute] String username, [FromRoute] String boardUniquename, [FromBody] dynamic node)
        {
            string authorization = Request.Headers["Authorization"];
            string token = authorization.Substring("Bearer ".Length).Trim();

            Int16 userId = _userService.GetUserId(token);
            board board = _context.board.FirstOrDefault(x => x.uniquename.Equals(boardUniquename) && x.owner_id == userId);

            node newNode = new node { title = node.title, description = node.description, owner_id = userId, board_id = board.id };
            _context.node.Add(newNode);
            _context.SaveChanges();

            if (node.parent_node_id != null)
            {
                node_relationship nodeRelationship = new node_relationship { parent_node_id = node.parent_node_id, child_node_id = newNode.id };
                _context.node_relationship.Add(nodeRelationship);
                _context.SaveChanges();
            }

            return _context.node.SingleOrDefault(rec => rec.id == newNode.id);
        }
    }
}