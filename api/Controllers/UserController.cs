using System;
using System.Net;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Mindmap.Models;
using Mindmap.Services;
using Mindmap.Util;

namespace Mindmap.Controllers
{
    [Authorize]
    [Route("mindmap/api/v1/users/")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly MindmapContext _context;
        private readonly MindmapContextForView _contextForView;
        private readonly UserService _userService;
        public UserController(MindmapContext context, MindmapContextForView contextForView, UserService userService)
        {
            _context = context;
            _contextForView = contextForView;
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
        [Route("{username}/boards/{boardUniquename}/")]
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
        [Route("{username}/boards/{boardUniquename}/")]
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
        public ActionResult<List<view_node>> GetNodesInBoard([FromRoute] String username, [FromRoute] String boardUniquename)
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

            List<view_node> nodes = _contextForView.view_node.Where(x => x.board_id == board.id && x.deleted_at == null).ToList();
            return nodes;
        }

        [HttpGet]
        [Route("{username}/boards/{boardUniquename}/relationship/")]
        public ActionResult<List<view_node_relationship>> GetRelationshipInBoard([FromRoute] String username, [FromRoute] String boardUniquename)
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
            return _contextForView.view_node_relationship.Where(x => x.board_id == board.id).ToList();
        }

        [HttpPost]
        [Route("{username}/boards/{boardUniquename}/relationship/")]
        public ActionResult<node_relationship> PostRelationshipInBoard([FromRoute] String username, [FromRoute] String boardUniquename, [FromBody] dynamic body)
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

            node_relationship nodeRelationship = new node_relationship { parent_node_id = body.parent_node_id, child_node_id = body.child_node_id };
            _context.node_relationship.Add(nodeRelationship);
            _context.SaveChanges();
            return nodeRelationship;
        }

        [HttpPost]
        [Route("{username}/boards/{boardUniquename}/nodes/")]
        public ActionResult<view_node> PostNode([FromRoute] String username, [FromRoute] String boardUniquename, [FromBody] dynamic node)
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

            return _contextForView.view_node.SingleOrDefault(rec => rec.id == newNode.id);
        }

        [HttpPatch]
        [Route("{username}/boards/{boardUniquename}/nodes/{nodeId}/")]
        public ActionResult<node> PatchNode([FromRoute] String username, [FromRoute] String boardUniquename, [FromRoute] Int16 nodeId, [FromBody] dynamic requestBody)
        {
            string authorization = Request.Headers["Authorization"];
            string token = authorization.Substring("Bearer ".Length).Trim();
            Int16 userId = _userService.GetUserId(token);

            node node = _context.node.FirstOrDefault(x => x.id == nodeId && x.owner_id == userId);

            if (requestBody.title != null)
            {
                node.title = requestBody.title;
            }
            if (requestBody.description != null)
            {
                node.description = requestBody.description;
            }
            _context.SaveChanges();
            return node;
        }

        [HttpDelete]
        [Route("{username}/boards/{boardUniquename}/nodes/{nodeId}/")]
        public ActionResult<dynamic> DeleteNode([FromRoute] String username, [FromRoute] String boardUniquename, [FromRoute] Int16 nodeId)
        {
            string authorization = Request.Headers["Authorization"];
            string token = authorization.Substring("Bearer ".Length).Trim();

            Int16 userId = _userService.GetUserId(token);
            node node = _context.node.FirstOrDefault(x => x.id == nodeId && x.owner_id == userId && x.deleted_at == null);

            if (node is null)
            {
                throw new MindMapException("Node not found", HttpStatusCode.NotFound);
            }
            else
            {
                node.deleted_at = DateTime.Now;
                Int32 deleteResult = _context.SaveChanges();
                if (deleteResult != 1)
                {
                    throw new MindMapException("Node not found", HttpStatusCode.ExpectationFailed);
                }
            }
            JSONResponse result = new JSONResponse(JSONResponseStatus.OK, new { });
            return result.toResponseObj();
        }
    }
}